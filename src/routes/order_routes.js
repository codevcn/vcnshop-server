import express from 'express'
import {
    getStripeKey,
    initPlaceOrder, completePlaceOrder, sendReceipt,
    getOrder, getOrders, getOrdersByAdmin,
    getOrdersForShop, findOrdersWithProductId,
    getOneOrderForShop,
} from '../controllers/order_controllers.js'
import { roleAuthorization, verifyJWTtoken, verifyShop } from '../middlewares/auth.js'
import {
    checkEmptyFieldsInBody,
    checkEmptyFieldsInQuery,
    checkOneOf,
    checkValidation,
    checkIsArrayInBody,
    checkIsNumberInBody,
    checkIsNumberInQuery,
    checkEmptyFieldsInParams,
    checkIsMongoIdInBody,
    checkIsMongoIdInQuery,
} from '../middlewares/input_validation.js'
import catchAsyncError from '../middlewares/catch_async_error.js'

const router = express.Router()

router.use(verifyJWTtoken)

router.get('/getStripeKey', catchAsyncError(getStripeKey))

router.post(
    '/initPlaceOrder',
    checkEmptyFieldsInBody('currency', 'shipping_info', 'items_of_order', 'price_of_items', 'tax_fee', 'shipping_fee', 'total_to_pay'),
    checkIsArrayInBody('items_of_order'),
    checkIsNumberInBody('price_of_items', 'total_to_pay', 'tax_fee', 'shipping_fee'),
    checkValidation,
    catchAsyncError(initPlaceOrder)
)

router.put(
    '/completePlaceOrder',
    checkEmptyFieldsInBody('orderId', 'paymentMethod'),
    checkIsMongoIdInBody('orderId'),
    checkValidation,
    catchAsyncError(completePlaceOrder)
)

router.post(
    '/sendReceiptViaEmail/:paymentId',
    checkEmptyFieldsInParams('paymentId'),
    checkValidation,
    catchAsyncError(sendReceipt)
)

router.get(
    '/getOrder',
    checkOneOf(checkEmptyFieldsInQuery('paymentId', 'orderId')),
    checkValidation,
    catchAsyncError(getOrder)
)

router.get(
    '/getOrders',
    checkEmptyFieldsInQuery('page', 'limit'),
    checkIsNumberInQuery('page', 'limit'),
    checkValidation,
    catchAsyncError(getOrders)
)

router.get(
    '/getOrdersForShop',
    verifyShop,
    checkEmptyFieldsInQuery('page', 'limit'),
    checkIsNumberInQuery('page', 'limit'),
    checkValidation,
    catchAsyncError(getOrdersForShop)
)

router.get(
    '/findOrdersWithProductId',
    verifyShop,
    checkEmptyFieldsInQuery('productId'),
    checkIsMongoIdInQuery('productId'),
    checkValidation,
    catchAsyncError(findOrdersWithProductId)
)

router.get('/getOrdersByAdmin', roleAuthorization('Admin'), catchAsyncError(getOrdersByAdmin))

router.get(
    '/getOneOrderForShop',
    checkEmptyFieldsInQuery('orderId'),
    checkIsMongoIdInQuery('orderId'),
    checkValidation,
    catchAsyncError(getOneOrderForShop)
)

export default router