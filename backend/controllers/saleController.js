// controllers/saleController.js
const Sale = require('../models/Sale');
const Item = require('../models/item'); // Ensure you have the correct path to the Item model

exports.createSale = async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();

  try {
    const { items, totalAmount, paymentType, customerName, paidAmount } = req.body;

    // Validate input
    if (!items || items.length === 0) {
      throw new Error('No items in the sale.');
    }
    if (paidAmount < 0 || totalAmount < 0) {
      throw new Error('Amounts must be positive.');
    }

    // Calculate balance
    const balanceAmount = totalAmount - paidAmount;

    // Create sale object
    const sale = new Sale({
      items,
      totalAmount,
      paymentType,
      customerName,
      paidAmount,
      balanceAmount,
    });

    // Save the sale and update stock
    const savedSale = await sale.save({ session });

    for (const soldItem of items) {
      const item = await Item.findOne({ itemCode: soldItem.itemCode }).session(session);

      if (!item) {
        throw new Error(`Item with code ${soldItem.itemCode} not found.`);
      }

      // Check for stock availability
      if (item.currentStock < soldItem.quantity) {
        throw new Error(`Insufficient stock for item: ${soldItem.itemName}.`);
      }

      // Update stock
      item.currentStock -= soldItem.quantity;
      await item.save({ session });
    }

    // Commit transaction
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Sale completed successfully!',
      sale: savedSale,
    });
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();

    res.status(500).json({
      message: 'Error processing the sale.',
      error: error.message,
    });
  }
};
