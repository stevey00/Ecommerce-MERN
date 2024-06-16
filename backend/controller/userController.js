const User = require('../models/userModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const sendToken = require('../utils/jwtToken.js')
const sendMail = require('../utils/sendMail.js')
const crypto = require('crypto')

// Register new user.
exports.createUser = catchAsyncErrors(async(req, res, next) => {
    const {name, email, password} = req.body

    const user = await User.create({
        name,
        email,
        password,
        avatar:{
            //for testing purpose.
            public_id:"https://test.com",
            url:"https://test.com"
        }
    })

    sendToken(user, 200, res)
    
    // const token = user.getJwtToken()
    // //we use token so that upon user registration, the user
    // //is redirected to the website and don't have to login again.

    // res.status(201).json({
    //     success: true,
    //     token
    //     //user
    // })
})

// login user
exports.loginUser = catchAsyncErrors(async(req, res, next) => {
    const {email, password} = req.body
    if(!email || !password){
        return next(new ErrorHandler("Please enter your email & password", 400))
    }

    const user = await User.findOne({email}).select("+password")

    if(!user){
        return next(new ErrorHandler("Sorry user is not found with this email & password.", 401))
    }

    const isPasswordMatched = await user.comparePassword(password)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Sorry user is not found with this email & password.", 401))
    }

    sendToken(user, 200, res)
})

// logout user
exports.logoutUser = catchAsyncErrors(async(req, res, next) => {
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })

    res.status(200).json({
        success: true,
        message:"log out sucess"
    })
})

// forgot password
exports.forgotPassword = catchAsyncErrors(async(req,res,next) => {
    const user = await User.findOne({email:req.body.email})

    if(!user){
        return next(new ErrorHandler("User not found with this email", 404))
    }

    //Get ResetPasswordToken
    const resetToken = user.getResetToken()
    await user.save({
        validateBeforeSave: false
    })

    const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl}`

    try{

        await sendMail({
            email: user.email,
            subject: `Ecommerce Password Recovery`,
            message
        })

        res.status(200).json({
            success:true,
            message: `Email sent to ${user.email} successfully`

        })

    } catch(error){
        user.resetPasswordToken = undefined
        user.resetPasswordTime = undefined

        await user.save({
            validateBeforeSave: false
        })
        return next(new ErrorHandler(error.message))
    }
})

// reset password 
exports.resetPassword = catchAsyncErrors(async(req, res, next) => {
    // create token hash
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex")

    const user = await user.findOne({
        resetPasswordToken,
        resetPasswordTime: { $gt: Date.now()}
    })

    if(!user){
        return next(new ErrorHandler("Reset password url is invalid or has been expired.", 400))
    }

    if(req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password does not match with the new password", 400))
    }

    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordTime = undefined

    await user.save()
    
    sendToken(user, 200, res)
})

// Get user details
exports.userDetails = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.user.id)

    res.status(200).json({
        success: true,
        user
    })
})

// Udate user password.
exports.updatePassword = catchAsyncErrors(async(req, res, next) => {

    const user = await User.findById(req.user.id).select("+password")

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword)

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old password is incorrect", 400))
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Sorry password don't match", 400))
    }

    user.password = req.body.newPassword

    await user.save()

    sendToken(user, 200, res)
})

// Udate user profile
exports.updateProfile = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email
    }

    //we add cloudinary letter then we are giving condition for the avatar(image)
    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })

})

// Get all user ----Admin
exports.getAllUsers = catchAsyncErrors(async(req, res, next) => {
    const users = await User.find()

    res.status(200).json({
        success: true,
        users
    })
})

// Get Single user details ----Admin
exports.getSingleUser = catchAsyncErrors(async(req, res, next) => {
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("Sorry, user is not found with this id", 400))
    }

    res.status(200).json({
        success: true,
        user
    })
})

// Change user role ----Admin
exports.updateUserRole = catchAsyncErrors(async(req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role
    }

    const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true,
        runValidators: true,
        useFindAndModify: false
    })

    res.status(200).json({
        success: true,
        user
    })

})


// Delete user ----Admin
exports.deleteUser = catchAsyncErrors(async(req, res, next) => {
    
    //we remove cloudinary letter then we are giving condition for the avatar(image)
    const user = await User.findById(req.params.id)

    if(!user){
        return next(new ErrorHandler("Sorry, user is not found with this id", 400))
    }

    await user.remove()

    res.status(200).json({
        success: true,
        message: "User deleted successfully."
    })

})