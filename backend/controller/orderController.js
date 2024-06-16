const Order = require('../models/orderModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const { resolveContent } = require('nodemailer/lib/shared')
const Product = require('../models/productModel')

//create order
exports.createOrder = catchAsyncErrors(async(req, res, next) => {
    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    } = req.body

    const order = await Order.create({
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt: Date.now(),
        user: req.user._id
    })

    res.status(201).json({
        success: true,
        order
    })
})

// get Single order details
exports.getSingleOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id).populate(
        "user",
        "name email"
    )

    if(!order){
        return next(new ErrorHandler("Order items not found with this id.", 404))
    }

    res.status(200).json({
        success: true,
        order
    })
})

// get all orders
exports.getAllOrders = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find({user: req.user._id})

    res.status(200).json({
        success: true,
        orders
    })
})

//get all orders ----Admin
exports.getAdminAllOrders = catchAsyncErrors(async(req, res, next) => {
    const orders = await Order.find()

    let totalAmount = 0

    orders.forEach((order) => {
        totalAmount += order.totalPrice
    })

    res.status(200).json({
        success: true,
        totalAmount,
        orders
    })
})

// update order status ----Admin
exports.updateAdminOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this id.", 404))
    }

    if(order.orderStatus === "Delivered"){
        return next(new ErrorHandler("Sorry, you have already delivered this order", 400))
    }

    if(order.orderStatus === "Shipped"){
        order.orderItems.forEach(async (i) => {
            await updateStock(i.product, i.quantity)
        })
    }
    order.orderStatus = req.body.status

    if (req.body.status === "Delivered"){
        order.deliveredAt = Date.now()
    }

    await order.save({ validateBeforeSave: false })
    res.status(200).json({
        success: true
    })
})

async function updateStock(id, quantity){
    const product = await Product.findById(id)

    product.stock -= quantity

    await product.save({ validateBeforeSave: false })
}

// order delete ----Admin
exports.deleteAdminOrder = catchAsyncErrors(async(req, res, next) => {
    const order = await Order.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this id.", 404))
    }

    await order.remove()

    res.status(200).json({
        success: true,
    })  
})