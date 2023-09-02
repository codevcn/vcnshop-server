
import shopService from '../services/shop_service.js'

const getShop = async (req, res, next) => {
    let shop = await shopService.getShop(req.user.shop.id)

    res.status(200).json({
        shop,
    })
}

const createShop = async (req, res, next) => {
    let { storeName, greeting, phone_number } = req.body
    let user_id = req.user._id

    let shop = await shopService.createShop(storeName, greeting, phone_number, user_id)

    res.status(200).json({ shop })
}

const getShopsByAdmin = async (req, res, next) => {
    let list = await shopService.getShopsByAdmin(req.query)

    res.status(200).json({ list })
}

export {
    getShop, createShop, getShopsByAdmin,
}