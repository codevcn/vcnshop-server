
import winston, { format } from 'winston'
import { loggingLevels, logglyTransport, loggingLabels } from '../configs/winston.js'

const errorLogger = winston.createLogger({
    transports: [
        logglyTransport,
    ],
    format: format.combine(
        format.timestamp(),
        format.json(),
    ),
    levels: loggingLevels,
    level: 'error',
})

const httpLogger = winston.createLogger({
    transports: [
        logglyTransport,
    ],
    format: format.combine(
        format.timestamp(),
        format.json(),
        format.label({ label: loggingLabels.HTTP, message: false })
    ),
    levels: loggingLevels,
    level: 'http',
})

const streamToLogger = {
    write: (message) => httpLogger.http(message),
}

export {
    errorLogger,
    streamToLogger,
} 