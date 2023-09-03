import BaseError from "../utils/base_error.js"
import logger from "../utils/logger.js"

const catchAsyncError = (asyncFunction) => {
    return (req, res, next) => {
        asyncFunction(req, res, next).catch((error) => {

            // this is to log errors
            if (error instanceof BaseError) {
                logger.error({
                    message: error.message,
                    label: logger.labels.Caught_Error,
                    trace: error.stack,
                })
            } else {
                logger.error({
                    message: error.message,
                    label: logger.labels.Async_Error,
                    trace: error.stack,
                })
            }

            next(error)
        })
    }
}

export default catchAsyncError