// backend/controllers/saleController.js
const mongoose = require('mongoose'); // Import mongoose
const Sale = require('../models/Sale'); // Import your Sale model
const Item = require('../models/item'); // Import your Item model

exports.createSale = async (req, res) => {
  const session = await mongoose.startSession(); // Start a session for transaction
  session.startTransaction();

  try {
    const saleData = req.body;
    
    // Create a new sale
    const sale = new Sale(saleData);
    await sale.save({ session });

    // Update stock for each item sold
    for (const item of saleData.items) {
      await Item.findOneAndUpdate(
        { itemCode: item.itemCode },
        { $inc: { currentStock: -item.quantity } }, // Decrease the stock
        { session }
      );
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json(sale);
  } catch (error) {
    console.error(error);
    await session.abortTransaction(); // Rollback transaction on error
    session.endSession();
    res.status(500).json({ message: 'Error saving sale data' });
  }
};


// Get all sales
exports.getSales = async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 }); // Sort by date descending
    if (!sales.length) {
      return res.status(404).json({ message: "No sales found." });
    }
    res.status(200).json(sales);
  } catch (error) {
    console.error("Error fetching sales:", error.message);
    res.status(500).json({ message: "Error fetching sales data." });
  }
};
