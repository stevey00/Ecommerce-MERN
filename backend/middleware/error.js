const ErrorHandler = require('../utils/errorHandler')

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.message = err.message || "Internal server error."

    // wrong mongodb id error handling when doing a get product detail request
    if(err.name === "CastError"){
        const message = `resource not found with this id..invalid ${err.path}`
        err = new ErrorHandler(message, 404)
    }
    
    // duplicate key error
    if(err.code === 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered.`
        err = new ErrorHandler(message, 400)
    }

    // Wrong Json web token(Jwt) error
    if(err.code === "jsonWebTokenError"){
        const message = `Your url(Jwt) is invalid please try again.`
        err = new ErrorHandler(message, 400)
    }

    // Jwt expired error
    if(err.code === "TokenExpireError"){
        const message = `Your url(Jwt) is expired please try again.`
        err = new ErrorHandler(message, 400)
    }


    res.status(err.statusCode).json({
        success: false,
        message: err.message
    })
}