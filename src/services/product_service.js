import ProductModel from '../models/product_model.js'
import BaseError from "../utils/base_error.js"
import mongoose from "mongoose"
import imageUploader from '../utils/image_uploader.js'
import shopService from './shop_service.js'
import errorMessage from '../configs/error_messages.js'
import moment from "moment"

class ProductService {

    async createProduct({ productName, category, targetGender, price, sizes, colors, stock, description, shop, images }) {
        let product_id = new mongoose.Types.ObjectId()

        let image_urls = await imageUploader.uploadProductImages(
            images,
            product_id,
        )

        let product = await ProductModel.create({
            '_id': product_id,
            'image_link': image_urls[0],
            'images': image_urls,
            'name': productName,
            'category': category,
            'target_gender': targetGender,
            'price': {
                value: price * 1,
            },
            'options': {
                'sizes': JSON.parse(sizes),
                'colors': JSON.parse(colors),
            },
            'stock': stock * 1,
            'shop': {
                id: shop.id,
            },
            'description': JSON.parse(description.slice(0, 500)),
        })

        await shopService.addProductId({
            shop_id: shop.id,
            product_id,
        })

        return product
    }

    async updateProduct({ images, productId, sizes, colors, stock, description }) {
        let update_format = {}

        if (images) {
            let image_urls = await imageUploader.uploadProductImages(
                images,
                productId,
            )
            update_format = {
                'image_link': image_urls[0],
                'images': image_urls,
            }
        }
        if (sizes && sizes.length > 0) {
            update_format = {
                ...update_format,
                'options.sizes': JSON.parse(sizes),
            }
        }
        if (colors && colors.length > 0) {
            update_format = {
                ...update_format,
                'options.colors': JSON.parse(colors),
            }
        }
        if (stock) {
            update_format = {
                ...update_format,
                'stock': stock,
            }
        }
        if (description) {
            update_format = {
                ...update_format,
                'description': JSON.parse(description),
            }
        }

        let product = await ProductModel.findOneAndUpdate(
            { '_id': productId },
            { $set: update_format },
            {
                runValidators: true,
                new: true,
                projection: {
                    'review.reviews': 0
                }
            },
        )

        return product
    }

    async deleteProduct(productId) {
        return await ProductModel.deleteOne({ '_id': productId })
    }

    async getProduct(productId) {
        let product = await ProductModel.findOne(
            { _id: productId },
            { 'review.reviews': 0 },
        ).lean()

        if (!product) throw new BaseError(errorMessage.PRODUCT_NOT_FOUND, 400)

        return product
    }

    async countProducts(query) {
        return await ProductModel.countDocuments(query)
    }

    async getProducts({ keyword, category, price, rating, limit, page, targetGender, shopId, stock, sort }) {
        let query = {}

        if (keyword)
            query.name = { $regex: new RegExp(keyword, 'i') }
        if (category)
            query.category = { $in: category }
        if (price && price.gte && price.lte)
            query['price.value'] = { $gte: price.gte * 1, $lte: price.lte * 1 }
        if (rating)
            query['review.average_rating'] = { $gte: rating * 1 }
        if (targetGender)
            query.target_gender = { $in: targetGender }
        if (shopId)
            query['shop.id'] = mongoose.Types.ObjectId(shopId)
        if (stock && stock.gte && stock.lte)
            query.stock = { $gte: stock.gte, $lte: stock.lte }

        let count_products = await this.countProducts(query)

        let products = await ProductModel
            .find(query, { 'review.reviews': 0 })
            .skip((page * 1 - 1) * (limit * 1)) // multiple with 1 for casting string to number
            .sort({ [sort.name]: sort.type })
            .limit(limit * 1)
            .lean()

        return { products, count_products }
    }

    async newReview({ productId, userId, avatar, user_name, rating, comment, title, images }) {
        let image_urls
        if (images)
            image_urls = await imageUploader.uploadReviewImages(
                images,
                productId,
                userId
            )

        let product = await ProductModel.aggregate([
            { $match: { '_id': mongoose.Types.ObjectId(productId) } },
            {
                $project: {
                    'review.average_rating': 1,
                    'review.count_reviews': 1,
                    'review.reviews': {
                        $filter: {
                            input: "$review.reviews",
                            as: "review",
                            cond: { $ne: ["$$review.user_id", userId] }
                        }
                    },
                }
            }
        ])
        if (product.length === 0) throw new BaseError(errorMessage.PRODUCT_NOT_FOUND, 404)

        let new_review = {
            name: user_name,
            user_id: userId,
            avatar,
            createdAt: new Date(),
            rating,
            title,
            comment: JSON.parse(comment),
            imageURLs: image_urls || [],
        }

        let new_reviews = [new_review, ...product[0].review.reviews]

        let new_count_reviews = new_reviews.length

        let sum_of_previous_ratings = new_reviews.reduce((accumulator, { rating }) => accumulator + rating, 0)
        let new_average_rating = sum_of_previous_ratings === 0 ? rating : (sum_of_previous_ratings / new_count_reviews)

        await ProductModel.updateOne(
            { _id: productId },
            {
                $set: {
                    'review.average_rating': new_average_rating,
                    'review.count_reviews': new_count_reviews,
                    'review.reviews': new_reviews,
                }
            },
            { runValidators: true }
        )

        return { new_review, new_average_rating, new_count_reviews }
    }

    async getReviews(productId, page, limit) {
        //format for query
        page *= 1
        page -= 1
        limit *= 1

        let product = await ProductModel.findById(
            { _id: productId },
            {
                '_id': 1,
                'review.reviews': {
                    $slice: [page * limit, limit],
                },
            }
        ).lean()

        if (!product)
            throw new BaseError(errorMessage.PRODUCT_NOT_FOUND, 404)

        return product.review.reviews
    }

    async getProductByIds(idList) {
        let products = await ProductModel.find(
            { _id: { $in: idList } },
            { 'review.reviews': 0 }
        )

        if (products.length === 0)
            throw new BaseError(errorMessage.PRODUCTS_NOT_FOUND, 404)

        return products
    }

    async getAllNames() {
        return await ProductModel.distinct('name')
    }

    async getProductsByAdmin(fields_set) {
        let format = {}

        for (let key of Object.keys(fields_set))
            format[key] = 1

        let products = await ProductModel.find({}, format)

        return products
    }

    async checkProducts(products, shop_id) {
        if (!shop_id) return

        let ids = products.map(({ _id }) => _id)

        let existedInOwnerShop = await this.countProducts({
            '_id': { $in: ids },
            'shop.id': shop_id,
        })

        if (existedInOwnerShop)
            throw new BaseError("You can't pay for your own product", 400)
    }

    async setProductAfterPlaceOrder(items_of_order) {
        let bulkOps = items_of_order.map(({ _id, quantity }) => ({
            updateOne: {
                filter: { _id: _id },
                update: {
                    $inc: {
                        'stock': -quantity,
                        'sold.count': quantity,
                    },
                    'sold.is_sold_last_time': moment()
                }
            }
        }))

        await ProductModel.bulkWrite(bulkOps)
    }

}

const productService = new ProductService()

export default productService