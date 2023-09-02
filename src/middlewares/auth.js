import BaseError from "../utils/base_error.js"
import jwt from "jsonwebtoken"
import UserModel from "../models/user_model.js"
import errorMessage from "../configs/error_messages.js"
import catchAsyncError from '../middlewares/catch_async_error.js'

const { JWT_SECRET_KEY } = process.env

const verifyJWTtoken = catchAsyncError(async (req, res, next) => {
    let token = req.cookies.JWT_token
    if (!token) throw new BaseError(errorMessage.TOKEN_NOT_FOUND, 401, null, true)

    let decoded_data
    let user

    try {
        decoded_data = jwt.verify(token, JWT_SECRET_KEY)

        user = await UserModel.findOne(
            { _id: decoded_data.userId },
            {
                '_id': 1,
                'name': 1,
                'avatar': 1,
                'email': 1,
                'role': 1,
                'shop': 1,
            }
        ).lean()
    } catch (error) {
        throw error
    }

    if (!user) throw new BaseError(errorMessage.USER_NOT_FOUND, 404)

    req.user = user

    next()
})

const roleAuthorization = (...valid_role_list) => catchAsyncError(async (req, res, next) => {
    let user = req.user
    if (!user) throw new BaseError()
    if (!valid_role_list.includes(user.role))
        throw new BaseError(errorMessage.INVALID_USER_ROLE, 403)
    next()
})

const verifyShop = catchAsyncError(async (req, res, next) => {
    let user = req.user
    if (!user)
        throw new BaseError(errorMessage.INTERNAL_SERVER_ERR, 500)
    let shop = user.shop
    if (!shop || !shop.id) throw new BaseError(errorMessage.SHOP_NOT_FOUND, 404)

    next()
})

export {
    verifyJWTtoken, roleAuthorization, verifyShop
}