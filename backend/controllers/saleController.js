// controllers/saleController.js
const Sale = require('../models/Sale');
const Item = require('../models/item'); // Ensure you have the correct path to the Item model

exports.createSale = async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();

  try {
    const { items, totalAmount, paymentType, customerName, paidAmount } = req.body;
  
    console.log("Received sale data: ", req.body);
  
    if (!items || items.length === 0) {
      throw new Error('No items in the sale.');
    }
  
    if (paidAmount < 0 || totalAmount < 0) {
      throw new Error('Amounts must be positive.');
    }
  
    const balanceAmount = totalAmount - paidAmount;
  
    const sale = new Sale({
      items,
      totalAmount,
      paymentType,
      customerName,
      paidAmount,
      balanceAmount,
    });
  
    const savedSale = await sale.save({ session });
  
    console.log("Sale saved successfully, updating stock...");
  
    for (const soldItem of items) {
      const item = await Item.findOne({ itemCode: soldItem.itemCode }).session(session);
      if (!item) {
        throw new Error(`Item with code ${soldItem.itemCode} not found.`);
      }
      if (item.currentStock < soldItem.quantity) {
        throw new Error(`Insufficient stock for item: ${soldItem.itemName}.`);
      }
      item.currentStock -= soldItem.quantity;
      await item.save({ session });
    }
  
    await session.commitTransaction();
    session.endSession();
  
    console.log("Transaction committed successfully");
  
    res.status(201).json({
      message: 'Sale completed successfully!',
      sale: savedSale,
    });
  } catch (error) {
    console.error("Error processing the sale: ", error.message);
  
    await session.abortTransaction();
    session.endSession();
  
    res.status(500).json({
      message: 'Error processing the sale.',
      error: error.message,
    });
  }
  
};
