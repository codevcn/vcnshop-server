
import BaseError from "../utils/base_error.js"
import errorMessage from '../configs/error_messages.js'
import { checkIsEmptyString } from '../middlewares/input_validation.js'
import productService from '../services/product_service.js'
import imageUploader from "../utils/image_uploader.js"

const createProduct = async (req, res, next) => {
    let {
        productName,
        category,
        targetGender,
        price,
        sizes,
        colors,
        stock,
        description,
    } = req.body

    let shop = req.user.shop
    let files = req.files

    if (!imageUploader.checkFilesExists(files, 'images'))
        throw new BaseError(errorMessage.INVALID_INPUT, 400)

    let product = await productService.createProduct({
        productName,
        category,
        targetGender,
        price,
        sizes,
        colors,
        stock,
        description,
        shop,
        images: files.images
    })

    res.status(200).json({ product })
}

const updateProduct = async (req, res, next) => {
    let images = req.files?.images

    let {
        productId,
        sizes,
        colors,
        stock,
        description,
    } = req.body

    let size_is_empty = checkIsEmptyString(sizes),
        color_is_empty = checkIsEmptyString(colors),
        stock_is_empty = checkIsEmptyString(stock),
        description_is_empty = checkIsEmptyString(description),
        productId_is_empty = checkIsEmptyString(productId)

    if (!images && size_is_empty && color_is_empty && stock_is_empty && description_is_empty && productId_is_empty)
        throw new BaseError(errorMessage.INVALID_INPUT, 400)

    let product = await productService.updateProduct({
        images,
        productId: productId_is_empty ? null : productId,
        sizes: size_is_empty ? null : sizes,
        colors: color_is_empty ? null : colors,
        stock: stock_is_empty ? null : stock,
        description: description_is_empty ? null : description,
    })

    res.status(200).json({ product })
}

const deleteProduct = async (req, res, next) => {
    let { productId } = req.params
    let shop_id = req.user.shop.id

    await productService.deleteProduct({
        product_id: productId,
        shop_id,
    })

    res.status(200).json({ success: true })
}

//get a product by _id
const getProduct = async (req, res, next) => {
    let { productId } = req.params

    let product = await productService.getProduct(productId)

    res.status(200).json({
        product,
    })
}

//get some products by query
const getProducts = async (req, res, next) => {
    let { keyword, category, price, rating, limit, page, targetGender, stock } = req.query

    let sort = req.query.sort || { name: 'name', type: 1 }

    let { products, count_products } = await productService.getProducts({
        keyword,
        category,
        price,
        rating,
        limit,
        page,
        targetGender,
        stock,
        sort
    })

    res.status(200).json({
        products,
        countProducts: count_products,
    })
}

const getProductsForShop = async (req, res, next) => {
    let { limit, page, stock } = req.query
    let shopId = req.user.shop?.id
    let sort = req.query.sort || { name: 'name', type: 1 }

    let { products, count_products } = await productService.getProducts({ limit, page, stock, shopId, sort })

    res.status(200).json({
        products,
        countProducts: count_products
    })
}

const getProductsByIds = async (req, res, next) => {
    let { idList } = req.body

    let products = await productService.getProductByIds(idList)

    res.status(200).json({ products })
}

const getReviews = async (req, res, next) => {
    let { productId, page, limit } = req.query

    let reviews = await productService.getReviews(productId, page, limit)

    res.status(200).json({
        reviews,
    })
}

//insert new review to DB
const newReview = async (req, res, next) => {
    let { productId } = req.query
    let { _id: userId, avatar, name: user_name } = req.user
    let { rating, comment, title } = req.body
    let images
    if (imageUploader.checkFilesExists(req.files, 'images'))
        images = req.files.images

    let { new_review, new_average_rating, new_count_reviews } = await productService.newReview({
        productId,
        userId,
        avatar,
        user_name,
        rating: rating * 1,
        comment,
        title,
        images
    })

    res.status(200).json({
        success: true,
        newReview: new_review,
        newAverageRating: new_average_rating,
        newCountReview: new_count_reviews,
    })
}

const getAllNames = async (req, res, next) => {
    let names = await productService.getAllNames()

    res.status(200).json({
        list: names,
    })
}

const checkProducts = async (req, res, next) => {
    let { products } = req.body
    let shop_id = req.user.shop?.id

    await productService.checkProducts(products, shop_id)

    res.status(200).json({ success: true })
}

const getProductsByAdmin = async (req, res, next) => {
    let fields_set = req.query

    let products = await productService.getProductsByAdmin(fields_set)

    res.status(200).json({ list: products })
}

export {
    getProducts, getProduct, getReviews,
    newReview, getAllNames, getProductsByAdmin,
    createProduct, updateProduct, deleteProduct,
    getProductsByIds, checkProducts,
    getProductsForShop,
}