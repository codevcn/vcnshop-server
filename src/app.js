import 'dotenv/config'
import express from "express"
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import ErrorHandler from './middlewares/error_handler.js'
import fileUpload from 'express-fileupload'
import initRoutes from './routes/routes.js'
import connectMongoDB from './configs/connectDB.js'
import morgan from 'morgan'
import { streamToLogger }from './utils/loggers.js'

//connect to database
connectMongoDB()

const app = express()

//block requests from a origin is different with own origin
app.use(cors({
    //>>> fix this: change orgin
    origin: 'http://localhost:3000',
    credentials: true,
}))

//body
app.use(bodyParser.urlencoded({ extended: true })) //handle data with form-data
app.use(bodyParser.json())
app.use(express.json())

//cookie
app.use(cookieParser())

//config for req.files
app.use(fileUpload())

//morgan
app.use(morgan(':remote-addr :method :status :url :res[content-length] - :response-time ms', { stream: streamToLogger }))

//create app routes
initRoutes(app)

//create error handler middleware
app.use(ErrorHandler)

export default app