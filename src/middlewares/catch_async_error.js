import BaseError from "../utils/base_error.js"
import { errorLogger } from "../utils/loggers.js"
import { loggingLabels } from "../configs/winston.js"

const catchAsyncError = (asyncFunction) => {
    return (req, res, next) => {
        asyncFunction(req, res, next).catch((error) => {

            // this is to log errors
            if (error instanceof BaseError) {
                errorLogger.error({ message: error.message, label: loggingLabels.Base_Error })
            } else {
                errorLogger.error({ message: error.message, label: loggingLabels.Async_Error })
            }

            next(error)
        })
    }
}

export default catchAsyncError