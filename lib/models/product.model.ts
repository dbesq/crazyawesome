import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    // TODO: url, currency, image, title, cP, oP, pH add: required: true
    url: { type: String },
    currency: { type: String },
    image: { type: String },
    title: { type: String },
    currentPrice: { type: Number },
    originalPrice: { type: Number },
    priceHistory: [
        {
            price: { type: Number },
            date: { type: Date, default: Date.now }
        },
    ],
    lowestPrice: { type: Number },
    highestPrice: { type: Number },
    averagePrice: { type: Number },
    discoutRate: { type: Number },
    description: { type: String },
    category: { type: String },
    reviewsCount: { type: Number },
    isOutOfStock: {type: Boolean, default: false },
    users: [
        { email: { type: String, required: true }}
    ],
    default: [],
},
    { timestamps: true })  // Keep track of changes

    const Product = mongoose.models.Product || mongoose.model('Product', productSchema)

    export default Product
