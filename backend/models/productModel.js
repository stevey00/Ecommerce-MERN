const mongoose = require('mongoose')
const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true, "Please enter a name of a product."],
        maxlength: [20, "Sorry, product name should not exceed 20 characters."]
    },
    description: {
        type: String,
        required: [true, "Please add a description for your product."],
        maxlength: [4000, "Sorry, description can't exceed 4000 characters."]
    },
    price: {
        type: Number,
        required: [true, "Please add a price for your product."],
        maxlength: [8, "Sorry, price can't exceed 8 figures."]
    },
    discountPrice: {
        type: String,
        maxlength: [4, "Sorry, dicount price can't exceed 4 characters."]
    },
    color: {
        type: String
    },
    size: {
        type: String
    },
    ratings: {
        type: Number,
        default: 0
    },
    images: [
        {
            public_id: {
                type: String,
                required: true
            },
            url: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: String,
        required: [true, "Please enter the category of your product."]
    },
    stock: {
        type: Number,
        required: [true, "Please add some stock for your product"],
        maxlength: [3, "Sorry, stock can't exceed 3 figures."]
    },
    numberOfReviews: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            user: {
                type: mongoose.Schema.ObjectId,
                ref:"User",
                required: true
            },
            name: {
                type: String,
                required: true
            },
            rating: {
                type: Number,
                required: true
            },
            comment: {
                type: String
            },
            time: {
                type: Date,
                default: Date.now()
            },
        },
    ],
    user: {
        type: mongoose.Schema.ObjectId,
        ref:"User",
        required: true
    }, 
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

module.exports = mongoose.model("product", productSchema)