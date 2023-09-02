import express from 'express'
import {
    getUser,
    updateProfile, changePassword, updateUserAvatar,
    getUserLocation,
    getUsersByAdmin,
} from '../controllers/user_controllers.js'
import { roleAuthorization, verifyJWTtoken } from '../middlewares/auth.js'
import {
    checkEmptyFieldsInBody,
    checkOneOf,
    checkValidation,
} from '../middlewares/input_validation.js'
import catchAsyncError from '../middlewares/catch_async_error.js'

const router = express.Router()

router.get('/getUser', verifyJWTtoken, catchAsyncError(getUser))

router.put(
    '/updateProfile',
    verifyJWTtoken,
    checkOneOf(checkEmptyFieldsInBody('nameOfUser', 'gender')),
    checkValidation,
    catchAsyncError(updateProfile)
)

router.put(
    '/changePassword',
    verifyJWTtoken,
    checkEmptyFieldsInBody('oldPassword', 'newPassword'),
    checkValidation,
    catchAsyncError(changePassword)
)

router.put('/updateUserAvatar', verifyJWTtoken, catchAsyncError(updateUserAvatar))

router.get('/getUserLocation', catchAsyncError(getUserLocation))

router.get('/getUsersByAdmin', verifyJWTtoken, roleAuthorization('Admin'), catchAsyncError(getUsersByAdmin))

export default router