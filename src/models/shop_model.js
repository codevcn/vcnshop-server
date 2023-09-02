import mongoose from 'mongoose'

const { Schema } = mongoose

const ShopSchema = new Schema({
    user: {
        id: {
            type: Schema.Types.ObjectId,
            ref: 'users',
            required: true,
            index: true,
            unique: true,
        }
    },
    name: {
        type: String,
        required: true,
        maxLength: [50, 'Length of greeting string is not greater than 100']
    },
    greeting: {
        type: String,
        required: true,
        maxLength: [500, 'Length of greeting string is not greater than 500']
    },
    products: {
        ids: [{ type: mongoose.Types.ObjectId }],
        count: {
            type: Number,
            min: [0, 'Number of count must not lower than 0'],
            default: 0,
        }
    },
    contact_info: {
        phone: {
            type: Number,
        },
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    avatar: {
        type: String,
    },
})

ShopSchema.pre('updateOne', function (next) {
    let update_set = this.getUpdate()
    if (update_set.$push && update_set.$push['products.ids']) {
        this.setUpdate({ ...update_set, $inc: { 'products.count': 1 } })
    } else if (update_set.$pull && update_set.$pull['products.ids']) {
        this.setUpdate({ ...update_set, $inc: { 'products.count': -1 } })
    }
    next()
})

const ShopModel = mongoose.model('shops', ShopSchema)

export default ShopModel