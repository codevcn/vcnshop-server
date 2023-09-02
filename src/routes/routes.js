import productRoutes from './product_routes.js'
import shopRoutes from './shop_routes.js'
import userRoutes from './user_routes.js'
import orderRoutes from './order_routes.js'
import authRoutes from './auth_routes.js'

const initRoutes = (app) => {
    app.use('/api/product', productRoutes)
    app.use('/api/shop', shopRoutes)
    app.use('/api/user', userRoutes)
    app.use('/api/order', orderRoutes)
    app.use('/api/auth', authRoutes)
}

export default initRoutes