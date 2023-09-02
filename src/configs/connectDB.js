import mongoose from "mongoose"

const { MONGODB_URI } = process.env

const connectMongoDB = async () => {
    try {
        await mongoose.connect(MONGODB_URI)
        console.log('>>> Connect DB successfully')
    } catch (err) {
        console.log('>>> Fail to connect DB >>>', err)
    }
}

export default connectMongoDB