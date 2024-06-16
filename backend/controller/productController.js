const Product = require('../models/productModel')
const ErrorHandler = require('../utils/errorHandler')
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const features = require('../utils/features')


//create product ---Admin
exports.createProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.create(req.body)

    res.status(201).json({
        success: true,
        product 
    })
})

// get all products
exports.getAllProducts = catchAsyncErrors(async(req, res, next) => {
    const resultPerPage = 8
    const productCount = await Product.countDocuments()
    const feature = new features(Product.find(), req.query)
    .search()
    .filter()
    .pagination(resultPerPage)
    const products = await feature.query
    res.status(200).json({
        success: true,
        products
    })
})

// update product ...Admin
exports.updateProduct = catchAsyncErrors(async(req, res, next) => {
    let product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Sorry, product is not found with this id.", 404))
    }
    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useUnified: false
    })
    res.status(200).json({
        sucess: true,
        product
    })
})

// delete product ----Admin
exports.deleteProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHandler("Sorry, product is not found with this id.", 404))
    }

    await product.remove()
    res.status(200).json({
        success: true,
        message: "Product deleted successfully."
    })
})

// single product details
exports.getSingleProduct = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("Sorry, product is not found with this id.", 404))
    }
    res.status(200).json({
        success: true,
        product,
        // productCount
    })

})

// Create and Update review. 
// When a new review is made for the same product, the previous review 
// is deleted and updated with new review.
exports.createProductReview = catchAsyncErrors(async(req, res, next) => {
    const {rating, comment, productId} = req.body
    
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }

    const product = await Product.findById(productId)

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    )

    if(isReviewed){
        product.reviews.forEach((rev) => {
            if(rev.user.toString() === req.user._id.toString())
            (rev.rating = rating), (rev.comment = comment)
        })
    } else{
        product.reviews.push(review)
        product.numberOfReviews = product.reviews.length
    }

    let avg = 0

    product.reviews.forEach((rev) => {
        avg += rev.rating
    })

    product.ratings = avg / product.reviews.length

    await product.save({ validateBeforeSave: false })

    res.status(200).json({
        success: true
    })
})

// Get all the reviews of a product.
exports.getSingleProductReviews = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.query.id)

    if(!product){
        return next(new ErrorHandler("Sorry, product is not found with this id.", 404))
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

// Delete Review  ----Admin.
exports.deleteReview = catchAsyncErrors(async(req, res, next) => {
    const product = await Product.findById(req.query.productId)

    if(!product){
        return next(new ErrorHandler("Sorry, product not found with this id.", 404))
    }

    const reviews = product.reviews.filter(
        (rev) => rev._id.toString() !== req.query.id.toString()
    )

    let avg = 0

    reviews.forEach((rev) => {
        avg += rev.rating
    })

    let ratings = 0

    if(reviews.length === 0){
        ratings = 0
    } else{
        ratings = avg / reviews.length
    }

    const numberOfReviews = reviews.length

    await Product.findByIdAndUpdate(
        req.query.productId,
        {
            reviews,
            ratings,
            numberOfReviews
        },
        {
            new: true,
            runValidators: true,
            useFindAndModify: false
        }
    )

    res.status(200).json({
        success: true
    })
})