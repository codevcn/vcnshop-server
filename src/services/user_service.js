import BaseError from '../utils/base_error.js'
import UserModel from '../models/user_model.js'
import imageUploader from '../utils/image_uploader.js'
import { IP2_ERROR } from '../configs/error_constants.js'
import { IP2_api } from '../apis/ip2_apis.js'
import errorMessage from '../configs/error_messages.js'
import axios from 'axios'

class UserService {

    async getUser(user_id) {
        let user = await UserModel.findOne(
            { _id: user_id },
            {
                '_id': 0,
                'name': 1,
                'email': 1,
                'gender': 1,
                'avatar': 1,
                'date_of_birth': 1,
                'role': 1,
            }
        ).lean()

        return user
    }

    async updateProfile(nameOfUser, gender, user_id) {
        let update = {}

        if (nameOfUser)
            update.name = nameOfUser
        if (gender)
            update.gender = gender

        await UserModel.updateOne(
            { _id: user_id },
            {
                $set: update
            },
            { runValidators: true }
        )
    }

    async changePassword(oldPassword, newPassword, user_id) {
        let user = await UserModel.findOne({ _id: user_id }, { 'password': 1 })

        let user_instance = new UserModel({ password: user.password })

        let isMatched = await user_instance.compareHashedPassword(oldPassword)
        if (!isMatched)
            throw new BaseError(errorMessage.INCORRECT_OLD_PASSWORD, 401, null, true)

        let hashed_newPassword = await user_instance.getHashedPassword(newPassword)

        await UserModel.updateOne(
            { _id: user_id },
            { $set: { 'password': hashed_newPassword } },
            { runValidators: true }
        )
    }

    async updateUserAvatar(user_id, avatarImage) {
        let avatar_url = await imageUploader.uploadUserAvatar(avatarImage, user_id)

        await UserModel.updateOne(
            { _id: user_id },
            { $set: { 'avatar': avatar_url } },
            { runValidators: true }
        )

        return avatar_url
    }

    async getUserLocation() {
        let { data } = await axios.get(IP2_api)
        if (!data)
            throw new BaseError(errorMessage.NETWORK_ERR, 502)

        let ip2_error = data.error
        if (ip2_error)
            throw new BaseError(errorMessage.UNSUABLE_SERVICE, ip2_error.error_code, IP2_ERROR)

        return data
    }

    async getUsersByAdmin(fields_set) {
        let format = {}

        for (let key of Object.keys(fields_set))
            format[key] = 1

        let users = await UserModel.find({}, format)

        return users
    }

}

const userService = new UserService()

export default userService