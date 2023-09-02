import mongoose from 'mongoose'
import moment from 'moment'

const { Schema } = mongoose

const EXPIRE_AFTER_SECONDS = 0

const TokenSchema = new Schema({
    type: {
        type: String,
        enum: ['state'],
        required: true,
    },
    token: {
        type: String,
        required: true,
    },
    expireAt: {
        type: Date,
        default: moment().add(3, 'days'),
        expires: EXPIRE_AFTER_SECONDS,
    },
})

const validate_token_length = function (value) {
    if (value && value.length === 30) {
        return true
    }

    return false
}

TokenSchema.path('token').validate(validate_token_length, 'The length of state token must be 30 characters')

const TokenModel = mongoose.model('tokens', TokenSchema)

export default TokenModel