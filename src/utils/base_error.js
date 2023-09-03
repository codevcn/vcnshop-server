import moment from "moment"

// error for both sync error and async error
class BaseError extends Error {
    constructor(message, statusCode, name, isUserError = false) {
        super(message)

        if (name) {
            this.name = name
        }

        this.statusCode = statusCode
        this.createdAt = moment()

        // status error includes errors such as: register timing out, user with the email existed in database, etc
        this.isUserError = isUserError

        // because Node.js is a JavaScript runtime built on the V8 JavaScript engine
        // and captureStackTrace method is only available on V8, this code will work
        Error.captureStackTrace(this, BaseError)
    }
}

export default BaseError