const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken')
const User = require('../models/userModel')

exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next) => {
    const {token} = req.cookies

    if(!token){
        return next(new ErrorHandler("Please login to access these resources.", 401))
    }

    const decodedData = jwt.verify(token, process.env.JWT_SECRET_KEY)

    req.user = await User.findById(decodedData.id)

    next()
})

// Admin Roles
exports.authorizedRoles = (...roles) => {
    return(req, res, next) => {
        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`${req.user.role} cannot access these resources.`))
        }
        next()
    }
}