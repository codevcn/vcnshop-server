
import orderService from "../services/order_service.js"

const getStripeKey = async (req, res, next) => {
    res.status(200).json({ stripe_key: orderService.getStripeKey() })
}

const initPlaceOrder = async (req, res, next) => {
    let {
        currency,
        shipping_info,
        items_of_order,
        price_of_items,
        tax_fee,
        shipping_fee,
        total_to_pay,
    } = req.body

    let { email, name, avatar, _id: user_id } = req.user

    let { client_secret, orderId, stripe_key } = await orderService.initPlaceOrder(
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
    )

    res.status(200).json({
        client_secret,
        stripe_key,
        orderId,
    })
}

// complete the order
const completePlaceOrder = async (req, res, next) => {
    let { orderId, paymentMethod } = req.body

    await orderService.completePlaceOrder(orderId, paymentMethod)

    res.status(200).json({ success: true })
}

const sendReceipt = async (req, res, next) => {
    let { paymentId } = req.params
    let email = req.user.email

    await orderService.sendReceipt(paymentId, email)

    res.status(200).json({ success: true })
}

const getOrder = async (req, res, next) => {
    let { paymentId, orderId } = req.query

    let order = await orderService.getOrder(paymentId, orderId)

    res.status(200).json({ order })
}

const findOrdersWithProductId = async (req, res, next) => {
    let { productId } = req.query

    let orders = await orderService.findOrdersByProductId(productId)

    res.status(200).json({ orders })
}

const getOneOrderForShop = async (req, res, next) => {
    let { orderId } = req.query
    let shop_id = req.user.shop.id

    let order = await orderService.getOneOrderForShop(orderId, shop_id)

    res.status(200).json({ order })
}

const getOrders = async (req, res, next) => {
    let { page, limit, paymentStatus } = req.query
    let user_id = req.user._id
    let sort = req.query.sort || { name: 'createdAt', type: -1 }

    let { orders, count_orders } = await orderService.getOrders(page, limit, sort, paymentStatus, user_id)

    res.status(200).json({ orders, countOrders: count_orders })
}

const getOrdersForShop = async (req, res, next) => {
    let { page, limit, orderStatus } = req.query

    let orders = await orderService.getOrdersForShop(page, limit, orderStatus, req.user.shop.id)

    res.status(200).json({ orders })
}

const getOrdersByAdmin = async (req, res, next) => {
    let fields_set = req.query

    let list = await orderService.getOrdersByAdmin(fields_set)

    res.status(200).json({ list })
}

export {
    getStripeKey,
    initPlaceOrder, completePlaceOrder, sendReceipt,
    getOrder, getOrders, getOrdersByAdmin,
    getOrdersForShop, findOrdersWithProductId,
    getOneOrderForShop,
}