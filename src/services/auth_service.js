import axios from "axios"
import {
    get_user_info_google_api,
    get_google_tokens_api,
    google_authorization_api,
} from '../apis/google_apis.js'
import BaseError from "../utils/base_error.js"
import errorMessage from "../configs/error_messages.js"
import UserModel from "../models/user_model.js"
import crypto from 'crypto'
import TokenModel from "../models/token_model.js"
import { getOAuthHtmlString } from '../utils/html_string_handlers.js'
import { sendOTPViaEmail } from '../utils/send_mail.js'
import moment from 'moment'

const {
    GOOGLE_OAUTH_CLIENT_ID,
    GOOGLE_OAUTH_CLIENT_SECRET,
    GOOGLE_OAUTH_REDIRECT_URI,
} = process.env

class AuthService {

    #GOOGLE_OAUTH_CLIENT_ID = GOOGLE_OAUTH_CLIENT_ID;
    #GOOGLE_OAUTH_CLIENT_SECRET = GOOGLE_OAUTH_CLIENT_SECRET;
    #GOOGLE_OAUTH_REDIRECT_URI = GOOGLE_OAUTH_REDIRECT_URI;

    async signInWithGoogle(access_token) {
        let user_data = await this.getUserDataGoogleOauth(access_token)

        let user_id = await this.createUserByGoogleAuth({
            ...user_data,
            access_token: access_token,
        })

        return user_id
    }

    async googleOAuth(auth_token, state_token) {
        let tokens, html_string, status

        try {
            tokens = await this.getTokens(auth_token, state_token)
        } catch (error) {
            html_string = await getOAuthHtmlString('fail', error.message)
            status = 500
            return { html_string, status }
        }

        html_string = await getOAuthHtmlString(
            'success',
            'Login successful! You may close this window now.',
            tokens.access_token,
        )

        status = 200

        return { html_string, status }
    }

    async createGoogleOAuthInfo() {
        let state_token = await this.createStateToken()

        let info = {
            url: google_authorization_api,
            redirect_uri: this.#GOOGLE_OAUTH_REDIRECT_URI,
            client_id: this.#GOOGLE_OAUTH_CLIENT_ID,
            access_type: "offline",
            response_type: "code",
            state: state_token,
            scope: [
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
            ].join(" "),
        }

        return info
    }

    async createStateToken() {
        let state_token = await TokenModel.create({
            token: crypto.randomBytes(15).toString('hex'),
            type: 'state',
        })

        return state_token.token
    }

    async confirmStateToken(state_token) {
        let token = await TokenModel.findOne({ token: state_token })

        if (token)
            return true
        else
            return false
    }

    async getTokens(auth_token, state_token) {
        let state_matched = await this.confirmStateToken(state_token)
        if (!state_matched)
            throw new BaseError(errorMessage.TOKEN_NOT_SECURE, 401)

        let { data } = await axios.post(
            get_google_tokens_api,
            {
                code: auth_token,
                client_id: this.#GOOGLE_OAUTH_CLIENT_ID,
                client_secret: this.#GOOGLE_OAUTH_CLIENT_SECRET,
                redirect_uri: this.#GOOGLE_OAUTH_REDIRECT_URI,
                grant_type: 'authorization_code',
            }
        )

        return data
    }

    async getUserDataGoogleOauth(access_token) {
        let { data } = await axios.get(
            get_user_info_google_api,
            {
                headers: {
                    Authorization: 'Bearer ' + access_token,
                },
            }
        )

        return data
    }

    getRandomPassword(email) {
        return `${email}_${crypto.randomBytes(10).toString('hex')}`
    }

    async createUserByGoogleAuth({ email, email_verified, name, picture, access_token }) {
        if (!email_verified)
            throw new BaseError(errorMessage.CANNOT_VERFIFY_EMAIL, 400)

        let user_exised = await UserModel.findOne({ email })

        if (user_exised) {
            return user_exised._id
        } else {
            let user_info = {
                name,
                email,
                password: this.getRandomPassword(email),
                avatar: picture,
                access_token,
            }

            let user = await UserModel.create(user_info)

            return user._id
        }
    }

    async sendRegisterOTP(email) {
        let user = await UserModel.findOne({ email }, { 'active': 1 })
        if (user && user.active)
            throw new BaseError(errorMessage.EMAIL_REGISTERED, 409, null, true)

        let user_instance = new UserModel()
        let OTP_code = user_instance.getOTPCode()
        let OTP_expire_in_minute = 5

        await sendOTPViaEmail(OTP_code, OTP_expire_in_minute, email, 'VCN Shop - Verify OTP For Register ✔', false)

        await UserModel.updateOne(
            { email },
            {
                $set: {
                    'OTP_code.value': OTP_code,
                    'OTP_code.expireAt': moment().add(OTP_expire_in_minute, 'minutes'),
                    'password': crypto.randomBytes(15).toString('hex'), //just for secure, not much important
                    'active': false,
                },
            },
            {
                upsert: true,
                runValidators: true
            }
        )
    }

    async verifyOTP(OTP_code, email) {
        let user = await UserModel.findOne(
            {
                email,
                'OTP_code.expireAt': { $gt: moment() },
            }
        ).lean()
        if (!user) throw new BaseError(errorMessage.VERIFY_OTP_TIMES_UP, 408, null, true)

        if (user.OTP_code.value !== OTP_code)
            throw new BaseError(errorMessage.INCORRECT_OTP, 401, null, true)

        await UserModel.updateOne(
            { email },
            {
                $set: {
                    'OTP_code.expireAt': moment().add(30, 'minutes'),
                }
            },
            { runValidators: true }
        )
    }

    async completeRegister(name_of_user, email, password, gender) {
        let user = await UserModel.findOne(
            {
                email,
                'OTP_code.expireAt': {
                    $gt: moment()
                }
            }
        ).lean()
        if (!user) throw new BaseError(errorMessage.REGISTER_TIMES_UP, 408, null, true)

        let user_instance = new UserModel()
        let hashed_password = await user_instance.getHashedPassword(password)

        await UserModel.updateOne(
            { email },
            {
                $set: {
                    name: name_of_user || 'Unname-User',
                    email,
                    password: hashed_password,
                    active: true,
                    gender,
                }
            },
            { runValidators: true }
        )

        return user._id
    }

    async loginUser(email, password) {
        let user = await UserModel.findOne(
            { email },
            {
                'active': 1,
                'password': 1,
                'avatar': 1,
                'name': 1,
            }
        ).lean()

        if (!user) throw new BaseError(errorMessage.INCORRECT_EMAIL_PASSWORD, 401, null, true)
        if (user && !user.active)
            throw new BaseError(errorMessage.USER_NOT_ACTIVE, 401, null, true)

        let user_instance = new UserModel({ password: user.password })
        let match_the_password = await user_instance.compareHashedPassword(password)

        if (!match_the_password)
            throw new BaseError(errorMessage.INCORRECT_EMAIL_PASSWORD, 401, null, true)

        return user._id
    }

    async fogotPassword(email) {
        let user = await UserModel.findOne({ email }, { 'active': 1, '_id': 0 })
        if (!user)
            throw new BaseError(errorMessage.EMAIL_NOT_REGISTERED, 404, null, true)
        if (user && !user.active)
            throw new BaseError(errorMessage.USER_NOT_ACTIVE, 401, null, true)

        let user_instance = new UserModel()
        let OTP_code = user_instance.getOTPCode()
        let OTP_expire_in_minute = 5

        await sendOTPViaEmail(OTP_code, OTP_expire_in_minute, email, 'VCN Shop - Verify OTP For Forgot Password ✔')

        await UserModel.updateOne(
            { email },
            {
                $set: {
                    'OTP_code.value': OTP_code,
                    'OTP_code.expireAt': moment().add(OTP_expire_in_minute, 'minutes'),
                }
            }
        )
    }

    async resetPassword(email, newPassword) {
        let user = await UserModel.findOne({ email, 'OTP_code.expireAt': { $gt: moment() } }).lean()
        if (!user) throw new BaseError(errorMessage.RESET_PASSWORD_TIMES_UP, 408, null, true)

        let user_instance = new UserModel()
        let hashed_password = await user_instance.getHashedPassword(newPassword)

        await UserModel.updateOne(
            { email },
            { $set: { 'password': hashed_password } },
            { runValidators: true }
        )

        return user._id
    }
}

const authService = new AuthService()

export default authService