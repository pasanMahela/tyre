const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    _id: { type: String, required: true }, // Identifier for the counter, e.g., 'itemCode'
    sequenceValue: { type: Number, required: true } // The current number in the sequence
});

const Counter = mongoose.model('Counter', counterSchema);

module.exports = Counter;
