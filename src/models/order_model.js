import mongoose from 'mongoose'

const { Schema } = mongoose

const OrderSchema = new Schema({
    shipping_info: {
        address: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        country: {
            type: String,
            required: true,
        },
        zip_code: {
            type: Number,
            required: true,
        },
        phone_number: {
            type: Number,
        },
        method: {
            type: String,
            required: true,
            enum: ['Sea', 'Airport'],
        }
    },
    items_of_order: [
        {
            _id: {
                type: Schema.Types.ObjectId,
                ref: "products",
                required: true,
            },
            name: {
                type: String,
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image_link: {
                type: String,
                required: true,
            },
            color: {
                type: String,
            },
            size: {
                type: String,
            },
            shop_id: {
                type: mongoose.Types.ObjectId,
                required: true,
                ref: 'shops',
            }
        }
    ],
    user: {
        id: {
            type: Schema.Types.ObjectId,
            ref: "users",
            required: true,
        },
        email: {
            type: String,
            required: true,
        },
        name: {
            type: String,
            required: true,
        },
        avatar: {
            type: String,
            required: true,
        }
    },
    payment_info: { // payment intent
        id: {
            type: String,
            required: true,
            index: true,
            unique: true,
        },
        method: {
            type: String,
            required: true,
        },
        client_secret: {
            type: String,
            required: true,
        }
    },
    payment_status: {
        type: String,
        required: true,
        enum: ['processing', 'canceled', 'succeeded'], // stripe, statuses of payment intent
    },
    price_of_items: {
        type: Number,
        required: true,
    },
    tax_fee: {
        type: Number,
        required: true,
    },
    shipping_fee: {
        type: Number,
        required: true,
    },
    total_to_pay: {
        type: Number,
        required: true,
    },
    order_status: {
        type: String,
        required: true,
        enum: ['uncompleted', 'processing', 'delivering', 'delivered'],
    },
    deliveredAt: {
        type: Date,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
})

const OrderModel = mongoose.model('orders', OrderSchema)

export default OrderModel