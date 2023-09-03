import winston, { format } from 'winston'
import { Loggly } from 'winston-loggly-bulk'

const loggingLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    verbose: 4,
    debug: 5,
    silly: 6
}

const logglyTransport = new Loggly({
    token: process.env.WINSTON_LOGGLY_ACCESS_TOKEN,
    subdomain: process.env.WINSTON_LOGGLY_SUBDOMAIN,
    tags: ["Winston-NodeJS"],
    json: true
})

const loggingLabels = {
    Input_Validation_Error: 'Input Validation Error',
    Async_Error: 'Async Error',
    Caught_Error: 'Caught Error',
    HTTP: 'HTTP Request',
    UNHANDLED_REJECTION: 'Unhandled Rejection',
    UNCAUGHT_EXCEPTION: 'Uncaught Exception',
}

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

export {
    loggingLevels,
    logglyTransport,
    loggingLabels,
    errorLogger,
    httpLogger,
}