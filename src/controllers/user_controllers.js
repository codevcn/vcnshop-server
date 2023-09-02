
import userService from '../services/user_service.js'
import imageUploader from '../utils/image_uploader.js'

const getUser = async (req, res, next) => {
    let user = await userService.getUser(req.user._id)

    res.status(200).json({ user })
}

const updateProfile = async (req, res, next) => {
    let { nameOfUser, gender } = req.body
    let user_id = req.user._id

    await userService.updateProfile(nameOfUser, gender, user_id)

    res.status(200).json({ success: true })
}

const changePassword = async (req, res, next) => {
    let { oldPassword, newPassword } = req.body
    let user_id = req.user._id

    await userService.changePassword(oldPassword, newPassword, user_id)

    res.status(200).json({ success: true })
}

const updateUserAvatar = async (req, res, next) => {
    let user_id = req.user._id
    let files = req.files

    if (!imageUploader.checkFilesExists(files, 'avatarImage'))
        throw new BaseError(errorMessage.INVALID_INPUT, 400)

    let avatar_url = await userService.updateUserAvatar(user_id, files.avatarImage)

    res.status(200).json({ avatarUrl: avatar_url })
}

const getUserLocation = async (req, res, next) => {
    let data = await userService.getUserLocation()

    res.status(200).json({
        country_name: data.country_name,
        region_name: data.region_name,
        city_name: data.city_name,
        zip_code: data.zip_code,
    })
}

const getUsersByAdmin = async (req, res, next) => {
    let fields_set = req.query

    let list = await userService.getUsersByAdmin(fields_set)

    res.status(200).json({ list })
}

export {
    getUser,
    updateProfile, changePassword, updateUserAvatar,
    getUserLocation, getUsersByAdmin,
}