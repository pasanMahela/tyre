// controllers/itemController.js
const Item = require('../models/item');

// Function to generate the next item code
const generateItemCode = async () => {
    const latestItem = await Item.findOne().sort({ itemCode: -1 }).limit(1);
    let nextCode = 'rt1'; // Default starting code

    if (latestItem) {
        const lastCode = latestItem.itemCode;
        const lastNumber = parseInt(lastCode.substring(2), 10); // Extract the numeric part after 'rt'
        const nextNumber = lastNumber + 1;
        nextCode = `rt${nextNumber}`;
    }

    return nextCode;
};

exports.addItem = async (req, res) => {
    try {
        const newItemCode = await generateItemCode();

        const newItem = new Item({
            itemCode: newItemCode,
            itemName: req.body.itemName,
            itemCompany: req.body.itemCompany,
            description: req.body.description,
            lowerLimit: req.body.lowerLimit,
            currentStock: req.body.currentStock,
            purchasePrice: req.body.purchasePrice,
            retailPrice: req.body.retailPrice,
            itemDiscount: req.body.itemDiscount,
            newStock: req.body.newStock
        });

        await newItem.save();
        res.status(201).json({ message: 'Item added successfully!', itemCode: newItemCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
