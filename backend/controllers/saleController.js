// controllers/saleController.js
const Sale = require('../models/Sale');
const Item = require('../models/item'); // Assuming you have an Item model

exports.createSale = async (req, res) => {
  const session = await Sale.startSession();
  session.startTransaction();

  try {
    const { items, totalAmount, paymentType, customerName, paidAmount } = req.body;

    // Calculate the balance amount
    const balanceAmount = totalAmount - paidAmount;

    // Create the sale object
    const sale = new Sale({
      items,
      totalAmount,
      paymentType,
      customerName,
      paidAmount,
      balanceAmount,
    });

    // Save the sale to the database
    const savedSale = await sale.save({ session });

    // Update the current stock of each item
    for (const soldItem of items) {
      const item = await Item.findOne({ itemCode: soldItem.itemCode }).session(session);
      
      if (!item) {
        throw new Error(`Item with code ${soldItem.itemCode} not found`);
      }
      
      // Ensure stock is sufficient
      if (item.currentStock < soldItem.quantity) {
        throw new Error(`Not enough stock for item ${soldItem.itemName}`);
      }

      // Reduce the current stock by the quantity sold
      item.currentStock -= soldItem.quantity;
      await item.save({ session });
    }

    // Commit the transaction
    await session.commitTransaction();
    session.endSession();

    // Respond with the saved sale
    res.status(201).json(savedSale);
  } catch (error) {
    // Rollback the transaction in case of error
    await session.abortTransaction();
    session.endSession();

    console.error('Error creating sale:', error);
    res.status(500).json({ message: 'Error creating sale', error: error.message });
  }
};
