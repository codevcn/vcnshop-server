import express from 'express'
import {
    getShop, createShop, getShopsByAdmin,
} from '../controllers/shop_controller.js'
import { roleAuthorization, verifyJWTtoken, verifyShop } from '../middlewares/auth.js'
import catchAsyncError from '../middlewares/catch_async_error.js'
import { checkEmptyFieldsInBody, checkValidation } from '../middlewares/input_validation.js'

const router = express.Router()

router.get('/getShop', verifyJWTtoken, verifyShop, catchAsyncError(getShop))

router.post(
    '/createShop',
    verifyJWTtoken,
    checkEmptyFieldsInBody('storeName', 'greeting', 'phone_number'),
    checkValidation,
    catchAsyncError(createShop)
)

router.get('/getShopsByAdmin', verifyJWTtoken, roleAuthorization('Admin'), catchAsyncError(getShopsByAdmin))

export default router