const mongoose = require('mongoose');
const Decimal128 = mongoose.Types.Decimal128;

const productSchema = new mongoose.Schema({
    title: { type: String, required: true },

    price: { 
        type: Decimal128, 
        required: true,
        get: v => v.toString(),
        set: v => Decimal128.fromString(v.toString())
    },
    image: { type: String, required: true },
    shortDescription: { type: String, required: true }, // Short description
    fullDescription: { type: String, required: true },  // Full description
    reviews: [{
        user: { type: String, required: true },
        feedback: { type: String, required: true }
    }],                        // Array of review strings
    totalSales: { type: Number, default: 0 }            // Total sales count
}, { 
    timestamps: true,
    toJSON: { getters: true },
    toObject: { getters: true }
});

module.exports = mongoose.model('Product', productSchema);