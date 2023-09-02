import OrderModel from "../models/order_model.js"
import BaseError from "../utils/base_error.js"
import Stripe from "stripe"
import { sendReceiptViaEmail } from '../utils/send_mail.js'
import mongoose from "mongoose"
import ProductModel from "../models/product_model.js"
import moment from "moment"
import errorMessage from "../configs/error_messages.js"

const { STRIPE_SECRET_KEY, STRIPE_PUBLIC_KEY } = process.env

const stripe = new Stripe(STRIPE_SECRET_KEY)

class OrderService {

    #stripe = stripe;
    #STRIPE_PUBLIC_KEY = STRIPE_PUBLIC_KEY;

    getStripeKey() {
        return this.#STRIPE_PUBLIC_KEY
    }

    async initPlaceOrder(
        {
            currency,
            shipping_info,
            items_of_order,
            price_of_items,
            tax_fee,
            shipping_fee,
            total_to_pay,
        },
        { email, name, avatar, user_id }
    ) {
        let paymentIntent = await this.#stripe.paymentIntents.create({
            receipt_email: email.toLowerCase(),
            amount: (total_to_pay * 100).toFixed(2) * 1,
            currency: currency.toLowerCase(),
            metadata: {
                'Company': 'VCN Shop - Fox COR',
            },
        })

        let { client_secret, id: paymentId } = paymentIntent

        let order = await OrderModel.create({
            shipping_info,
            items_of_order,
            price_of_items,
            tax_fee,
            shipping_fee,
            total_to_pay,
            order_status: 'uncompleted',
            payment_status: 'processing',
            payment_info: {
                id: paymentId,
                method: 'none',
                client_secret,
            },
            user: {
                id: user_id,
                email: email,
                name: name,
                avatar: avatar,
            },
        })

        return {
            client_secret,
            orderId: order._id,
            stripe_key: this.getStripeKey(),
        }
    }

    async completePlaceOrder(orderId, paymentMethod) {
        let order = await OrderModel.findOne(
            { _id: orderId },
            { 'items_of_order': 1 }
        ).lean()
        if (!order)
            throw new BaseError(errorMessage.ORDER_NOT_FOUND, 404)

        await OrderModel.updateOne(
            { _id: orderId },
            {
                $set: {
                    'payment_status': 'succeeded',
                    'payment_info.method': paymentMethod,
                    'order_status': 'processing',
                }
            },
            { runValidators: true }
        )

        let bulkOps = order.items_of_order.map(({ _id, quantity }) => ({
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

    async sendReceipt(paymentId, email) {
        let order = await OrderModel.findOne({ 'payment_info.id': paymentId }).lean()
        if (!order) throw new BaseError(errorMessage.ORDER_NOT_FOUND, 404)

        await sendReceiptViaEmail(
            email,
            'Receipt Of Payment ' + paymentId,
            {
                paymentInfo: order.payment_info,
                shippingInfo: order.shipping_info,
                receiverInfo: order.user,
                items: order.items_of_order,
                shippingFee: order.shipping_fee,
                taxFee: order.tax_fee,
                totalToPay: order.total_to_pay,
                createdAt: order.createdAt,
            }
        )
    }

    async getOrder(paymentId, orderId) {
        let order_query = {}
        if (paymentId) order_query['payment_info.id'] = paymentId
        else order_query._id = orderId

        let order = await OrderModel.findOne(order_query).lean()
        if (!order) throw new BaseError(errorMessage.ORDER_NOT_FOUND, 404)

        return order
    }

    async findOrdersByProductId(productId) {
        return await OrderModel.find(
            { 'items_of_order._id': productId }
        ).lean()
    }

    async getOneOrderForShop(orderId, shop_id) {
        let orders = await OrderModel.aggregate([
            { $match: { _id: mongoose.Types.ObjectId(orderId) } },
            {
                $addFields: {
                    'items': {
                        $filter: {
                            input: "$items_of_order",
                            as: "item",
                            cond: { $eq: ["$$item.shop_id", shop_id] }
                        }
                    },
                }
            },
            {
                $project: {
                    'items_of_order': 0,
                    'price_of_items': 0,
                    'total_to_pay': 0,
                }
            },
        ])

        if (orders.length === 0) throw new BaseError(errorMessage.ORDER_NOT_FOUND, 404)

        return orders[0]
    }

    async getOrders(page, limit, sort, paymentStatus, user_id) {
        let query_object = { 'user.id': user_id }
        if (paymentStatus) query_object.payment_status = paymentStatus

        let orders = await OrderModel
            .find(
                query_object,
                {
                    'createdAt': 1,
                    '_id': 1,
                    'order_status': 1,
                    'payment_status': 1,
                    'items_of_order': {
                        $slice: ['$items_of_order', 0, 2]
                    },
                }
            )
            .skip((page * 1 - 1) * (limit * 1))
            .sort({ [sort.name]: sort.type })
            .limit(limit * 1)
            .lean()

        let count_orders = await OrderModel.countDocuments(query_object)

        return { orders, count_orders }
    }

    async getOrdersForShop(page, limit, orderStatus, shop_id) {
        let query_object = { 'items_of_order.shop_id': mongoose.Types.ObjectId(shop_id) }
        if (orderStatus) query_object.order_status = orderStatus

        let orders = await OrderModel.aggregate([
            { $match: query_object },
            {
                $addFields: {
                    'items': {
                        $filter: {
                            input: "$items_of_order",
                            as: "item",
                            cond: { $eq: ["$$item.shop_id", shop_id] }
                        }
                    },
                }
            },
            {
                $project: {
                    'items_of_order': 0,
                    'price_of_items': 0,
                    'total_to_pay': 0,
                }
            },
        ])

        let slice_begin = (page * 1 - 1) * (limit * 1)
        orders = orders.slice(slice_begin, slice_begin + limit)

        return orders
    }

    async getOrdersByAdmin(fields_set) {
        let format = {}

        for (let key of Object.keys(fields_set))
            format[key] = 1

        let orders = await OrderModel.find({}, format)

        return orders
    }
}

const orderService = new OrderService()

export default orderService