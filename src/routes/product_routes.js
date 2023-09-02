import express from 'express'
import {
    getProducts, getProduct, getReviews,
    newReview, getAllNames, getProductsByAdmin,
    createProduct, updateProduct, deleteProduct,
    getProductsByIds,
    checkProducts,
    getProductsForShop,
} from '../controllers/product_controllers.js'
import { roleAuthorization, verifyJWTtoken, verifyShop } from '../middlewares/auth.js'
import {
    checkEmptyFieldsInBody,
    checkEmptyFieldsInParams,
    checkEmptyFieldsInQuery,
    checkIsMongoIdListInBody,
    checkIsMongoIdInParams,
    checkIsMongoIdInQuery,
    checkIsNumberInBody,
    checkIsNumberInQuery,
    checkValidation,
    checkIsArrayInJSONBody,
    checkOptional,
} from '../middlewares/input_validation.js'
import catchAsyncError from '../middlewares/catch_async_error.js'

const router = express.Router()

router.get(
    '/getProducts',
    checkEmptyFieldsInQuery('limit', 'page'),
    checkIsNumberInQuery('limit', 'page'),
    checkValidation,
    catchAsyncError(getProducts)
)

router.get(
    '/getProductsForShop',
    verifyJWTtoken,
    verifyShop,
    checkEmptyFieldsInQuery('limit', 'page'),
    checkValidation,
    catchAsyncError(getProductsForShop)
)

router.get(
    '/getProduct/:productId',
    checkEmptyFieldsInParams('productId'),
    checkIsMongoIdInParams('productId'),
    checkValidation,
    catchAsyncError(getProduct)
)

router.get(
    '/getReviews',
    checkEmptyFieldsInQuery('productId', 'page', 'limit'),
    checkIsMongoIdInQuery('productId'),
    checkIsNumberInQuery('limit', 'page'),
    checkValidation,
    catchAsyncError(getReviews)
)

router.post(
    '/newReview',
    verifyJWTtoken,
    checkEmptyFieldsInQuery('productId'),
    checkEmptyFieldsInBody('rating', 'comment', 'title'),
    checkIsMongoIdInQuery('productId'),
    checkIsNumberInBody('rating'),
    checkValidation,
    catchAsyncError(newReview)
)

router.get('/getProductsName', catchAsyncError(getAllNames))

router.get('/getProductsByAdmin', verifyJWTtoken, roleAuthorization('Admin'), catchAsyncError(getProductsByAdmin))

router.post(
    '/createProduct',
    verifyJWTtoken,
    verifyShop,
    checkEmptyFieldsInBody('productName', 'category', 'targetGender', 'price', 'sizes', 'colors', 'stock', 'description'),
    checkIsNumberInBody('price', 'stock'),
    checkIsArrayInJSONBody('sizes', 'colors'),
    checkValidation,
    catchAsyncError(createProduct)
)

router.post(
    '/updateProduct',
    verifyJWTtoken,
    verifyShop,
    checkOptional(checkIsArrayInJSONBody('colors', 'sizes')),
    catchAsyncError(updateProduct)
)

router.delete(
    '/deleteProduct/:productId',
    verifyJWTtoken,
    verifyShop,
    checkEmptyFieldsInParams('productId'),
    checkIsMongoIdInParams('productId'),
    checkValidation,
    catchAsyncError(deleteProduct)
)

router.post(
    '/checkProducts',
    verifyJWTtoken,
    verifyShop,
    checkEmptyFieldsInBody('products'),
    checkValidation,
    catchAsyncError(checkProducts)
)

router.post(
    '/getProductsByIds',
    checkEmptyFieldsInBody('idList'),
    checkIsMongoIdListInBody('idList'),
    checkValidation,
    catchAsyncError(getProductsByIds)
)

export default router