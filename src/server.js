
import 'dotenv/config'
import app from "./app.js"
import logger from './utils/logger.js'

const { PORT } = process.env || 8080

const server = app.listen(PORT, () => {
    console.log(`>>> Server is working on http://localhost:${PORT}`)
})

process.on('unhandledRejection', (reason, promise) => {
    console.log('>>> UNHANDLED REJECTION !!!')

    logger.error({
        message: reason.message,
        label: logger.labels.UNHANDLED_REJECTION,
        trace: reason.stack,
    })

    process.exit(1)
})

//process error
process.on("uncaughtException", (error) => {
    console.log(">>> UNCAUGHT EXCEPTION !!!")

    logger.error({
        message: error.message,
        label: logger.labels.UNCAUGHT_EXCEPTION,
        trace: error.stack,
    })
    
    process.exit(1)
})