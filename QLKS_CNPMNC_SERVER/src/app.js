require("dotenv").config();

const express = require('express')
const morgan = require('morgan')
const compression = require('compression')
const { default : helmet } = require('helmet')
const app = express()

//init middlewares
app.use(morgan("dev"))
// morgan("comnined")
// morgan("common")
// morgan("short")
// morgan("tiny")
app.use(helmet())
app.use(compression())
app.use(express.json())
app.use(express.urlencoded({
    extended: true
}))
//init db
require('./databases/init.mongodb.lv1')
// const { checkOverLoad } =  require('./helpers/check.connect')
// checkOverLoad()
// init routes
// app.get('/', ( req, res, next) => {
//     return res.status(200).json({
//         message: 'Welcome tipsJS'
//     })
// })
app.use('/', require('./routes'))
//hanlding errors
app.use((req, res, next) => {
  const error = new Error('Not Found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  const statusCode = error.status || 500
  return res.status(statusCode).json({
    status: 'error',
    code: statusCode,
    stack: error.stack,
    message: error.message || 'Internal Server Error'
  })
})

module.exports = app
