const mongoose = require('mongoose');

const purchaseSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    customer: {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true
        }
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    totalAmount: {
        type: Number,
        required: true
    },
    purchaseDate: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'pending'
    }
}, { timestamps: true });

// Calculate total amount before saving
purchaseSchema.pre('save', async function(next) {
    const product = await mongoose.model('Product').findById(this.product);
    if (product) {
        const price = parseFloat(product.price);
        this.totalAmount = price * this.quantity;
    }
    next();
});

module.exports = mongoose.model('Purchase', purchaseSchema);