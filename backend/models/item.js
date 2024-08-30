const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
    itemCode: { type: String, required: true, unique: true },
    itemName: { type: String, required: true },
    itemCompany: { type: String, required: true },
    description: { type: String },
    lowerLimit: { type: Number },
    currentStock: { type: Number },
    purchasePrice: { type: Number },
    retailPrice: { type: Number },
    itemDiscount: { type: Number },
    newStock: { type: Number }
});

module.exports = mongoose.model('Item', itemSchema);
