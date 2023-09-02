import express from 'express'
import {
    sendRegisterOTP, verifyOTP, completeRegister,
    loginUser, forgotPassword, resetPassword,
    logoutUser, googleOauth, signInWithGoogle,
    getGoogleOAuthInfo,
} from '../controllers/auth_controllers.js'
import {
    checkEmptyFieldsInBody,
    checkEmptyFieldsInQuery,
    checkIsEmailInBody,
    checkIsNumberInBody,
    checkValidation,
} from '../middlewares/input_validation.js'
import catchAsyncError from '../middlewares/catch_async_error.js'

const router = express.Router()

router.post(
    '/sendRegisterOTP',
    checkEmptyFieldsInBody('email'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(sendRegisterOTP)
)

router.post(
    '/verifyOTP',
    checkEmptyFieldsInBody('OTP_code', 'email'),
    checkIsNumberInBody('OTP_code'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(verifyOTP)
)

router.post(
    '/completeRegister',
    checkEmptyFieldsInBody('name', 'email', 'password', 'gender'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(completeRegister)
)

router.post(
    '/loginUser',
    checkEmptyFieldsInBody('email', 'password'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(loginUser)
)

router.post(
    '/forgotPassword',
    checkEmptyFieldsInBody('email'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(forgotPassword)
)

router.post(
    '/resetPassword',
    checkEmptyFieldsInBody('email', 'newPassword'),
    checkIsEmailInBody(),
    checkValidation,
    catchAsyncError(resetPassword)
)

router.post('/logoutUser', catchAsyncError(logoutUser))

router.get('/oauth/googleAuthorization', checkEmptyFieldsInQuery('code', 'state'), checkValidation, catchAsyncError(googleOauth))

router.post('/googleSignIn', checkEmptyFieldsInBody('access_token'), checkValidation, catchAsyncError(signInWithGoogle))

router.get('/getGoogleOAuthInfo', catchAsyncError(getGoogleOAuthInfo))

export default router