import moment from 'moment'
import { IP2_ERROR } from '../configs/error_constants.js'

class ErrorSetting {
    name
    message
    statusCode
    createdAt
    isUserError
    stack

    constructor(message, statusCode, name, createdAt, isUserError, stack) {
        this.statusCode = statusCode || 500
        this.name = name || 'Unname Error'
        this.message = message || "Internal Server Error"
        this.trace = stack || 'Unknown'
        this.createdAt = createdAt || moment()
        this.isUserError = isUserError || false
    }

    modifyErrorByIP2() {
        if (this.name === IP2_ERROR) {
            if (this.statusCode === 10001)
                this.message = 'Invalid IP address.'

            this.statusCode = 500
        }
    }

    modifyErrorByMongoErr() {
        //mongoose error due to casting
        if (this.name === 'ValidationError') {
            this.message = 'Invalid data type for mongoose: ' + err.message
            this.statusCode = 400
        }
    }
}

const ErrorHandler = (err, req, res, next) => {
    //init error original detail
    let error = new ErrorSetting(err.message, err.statusCode, err.name, err.createdAt, err.isUserError, err.stack)

    error.modifyErrorByMongoErr()

    //ip2 error
    error.modifyErrorByIP2()

    res
        .status(error.statusCode)
        .json({
            name: error.name,
            message: error.message,
            trace: error.trace,
            createdAt: error.createdAt,
            isUserError: error.isUserError,
        })
}

export default ErrorHandler