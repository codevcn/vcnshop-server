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

        Error.captureStackTrace(this)
    }
}

export default BaseError