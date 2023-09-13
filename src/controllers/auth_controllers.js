
import jwtToken from '../utils/JWT_token.js'
import authService from '../services/auth_service.js'

// get parameters for google oauth url
const getGoogleOAuthInfo = async (req, res, next) => {
    let google_oauth_info = await authService.createGoogleOAuthInfo()

    res.status(200).json({
        ...google_oauth_info,
    })
}

const googleOauth = async (req, res, next) => {
    let auth_token = req.query.code
    let state_token = req.query.state

    let { status, html_string } = await authService.googleOAuth(auth_token, state_token)

    res.status(status).send(html_string)
}

const signInWithGoogle = async (req, res, next) => {
    let { access_token } = req.body

    let user_id = await authService.signInWithGoogle(access_token)

    jwtToken.sendToken(res, user_id)

    res.status(200).json({ success: true })
}

const logoutUser = async (req, res, next) => {
    jwtToken.removeToken(res)

    res.status(200).json({ success: true })
}

const sendRegisterOTP = async (req, res, next) => {
    let email = req.body.email

    await authService.sendRegisterOTP(email)

    res.status(200).json({ success: true })
}

const verifyOTP = async (req, res, next) => {
    let { OTP_code, email } = req.body

    await authService.verifyOTP(OTP_code, email)

    res.status(200).json({ success: true })
}

const completeRegister = async (req, res, next) => {
    let { name, email, password, gender } = req.body

    let user_id = await authService.completeRegister(name, email, password, gender)

    jwtToken.sendToken(res, user_id)

    res.status(200).json({ success: true })
}

const loginUser = async (req, res, next) => {
    let { email, password } = req.body

    let user_id = await authService.loginUser(email, password)

    jwtToken.sendToken(res, user_id)

    res.status(200).json({ success: true })
}

const forgotPassword = async (req, res, next) => {
    let { email } = req.body

    await authService.fogotPassword(email)

    res.status(200).json({ success: true })
}

// only for register period
const resetPassword = async (req, res, next) => {
    let { email, newPassword } = req.body

    let user_id = await authService.resetPassword(email, newPassword)

    jwtToken.sendToken(res, user_id)

    res.status(200).json({ success: true })
}

// prevent Render.com from sleeping
const callAPIFromHosting = async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'Response from VCN-Server',
    })
}

export {
    googleOauth, signInWithGoogle,
    sendRegisterOTP, verifyOTP, completeRegister,
    loginUser, logoutUser, getGoogleOAuthInfo,
    forgotPassword, resetPassword,
    callAPIFromHosting,
}