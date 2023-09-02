import ShopModel from '../models/shop_model.js'
import BaseError from '../utils/base_error.js'
import UserModel from '../models/user_model.js'
import errorMessage from '../configs/error_messages.js'
import moment from 'moment'

class ShopService {

    async getShop(shop_id) {
        let shop = await ShopModel.findOne(
            { '_id': shop_id },
            {
                'products': 0,
            }
        ).lean()

        if (!shop) throw new BaseError(errorMessage.SHOP_NOT_FOUND, 404)

        return shop
    }

    async createShop(storeName, greeting, phone_number, user_id) {
        let shop = await ShopModel.create({
            'name': storeName,
            'greeting': greeting,
            'user': {
                id: user_id,
            },
            'contact_info': {
                phone: phone_number,
            },
        })

        await UserModel.updateOne(
            { '_id': user_id },
            {
                $set: {
                    'shop.id': shop._id,
                    'shop.createdAt': moment(),
                }
            }
        )

        return shop
    }

    async getShopsByAdmin(fields_set) {
        let format = {}
        
        for (let key of Object.keys(fields_set))
            format[key] = 1

        let list = await ShopModel.find({}, format)

        return list
    }

}

const shopService = new ShopService()

export default shopService