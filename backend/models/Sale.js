// backend/models/Sale.js
const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  items: [{
    itemCode: String,
    itemName: String,
    quantity: Number,
    price: Number,
    discount: Number,
    totalPrice: Number
  }],
  totalAmount: Number,
  discount: Number,
  netValue: Number,
  cashPaid: Number,
  balance: Number,
  date: { type: Date, default: Date.now },
  paymentType: String,
});

module.exports = mongoose.model('Sale', saleSchema);
