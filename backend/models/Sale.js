// models/Sale.js
const mongoose = require('mongoose');

const SaleItemSchema = new mongoose.Schema({
  itemCode: { type: String, required: true },
  itemName: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
});

const SaleSchema = new mongoose.Schema({
  items: [SaleItemSchema],
  totalAmount: { type: Number, required: true },
  paymentType: { type: String, required: true }, // e.g., "Cash", "Card"
  customerName: { type: String },
  paidAmount: { type: Number, required: true },
  balanceAmount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Sale = mongoose.model('Sale', SaleSchema);

module.exports = Sale;
