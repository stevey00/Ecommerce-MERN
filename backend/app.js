const express = require('express')
const app = express()
const ErrorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')

app.use(express.json())
app.use(cookieParser())

// route imports
const product = require('./routes/productRoute')
const user = require('./routes/userRoute')
const order = require('./routes/orderRoute')

app.use('/api/v2', product)
app.use('/api/v2', user)
app.use('/api/v2', order)

// for error handling
app.use(ErrorHandler)

module.exports = app