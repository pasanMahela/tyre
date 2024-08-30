const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    itemCompany: { type: String, required: true },
    description: { type: String },
    lowerLimit: { type: Number },
    currentStock: { type: Number, default: 0 }, // Added field
    purchasePrice: { type: Number },
    retailPrice: { type: Number },
    itemDiscount: { type: Number },
    category: { type: String },  // Existing field
    itemLocation: { type: String },  // Existing field
    barcode: { type: String },  // Existing field
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Item', itemSchema);
