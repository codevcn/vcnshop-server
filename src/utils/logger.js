import {
    loggingLevels,
    logglyTransport,
    loggingLabels,
    errorLogger,
    httpLogger,
} from '../configs/winston.js'

class Logger {
    labels = loggingLabels
    levels = loggingLevels
    transports = logglyTransport
    errorLogger = errorLogger
    httpLogger = httpLogger

    error({ message, label, trace }) {
        this.errorLogger.error({
            message: `[message]: ${message} , [trace]: ${trace || 'NO TRACE'}`,
            label,
        })
    }

    http({ message }) {
        this.httpLogger.http(message)
    }

    streamToLogger() {
        return {
            write: (message) => this.http({ message })
        }
    }
}

const logger = new Logger()

export default logger