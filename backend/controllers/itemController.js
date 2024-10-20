const Item = require('../models/item');
const Counter = require('../models/Counter'); // Adjust the path as necessary
const mongoose = require('mongoose');    // Import mongoose

// Function to generate the next item code
const generateItemCode = async () => {
    try {
        const counter = await Counter.findByIdAndUpdate(
            'itemCode',
            { $inc: { sequenceValue: 1 } },
            { new: true, upsert: true }
        );

        if (!counter) {
            throw new Error('Counter document not found or failed to create.');
        }

        // Log the counter details for debugging
        console.log('Counter document:', counter);

        const nextCode = `${counter.sequenceValue}rt`;
        return nextCode;
    } catch (error) {
        console.error('Error generating item code:', error.message);
        throw new Error('Error generating item code: ' + error.message);
    }
};



exports.addItem = async (req, res) => {
    try {
        const newItemCode = await generateItemCode(); // Generate the new item code

        const newItem = new Item({
            itemCode: newItemCode, // Use the generated code
            itemName: req.body.itemName,
            itemCompany: req.body.itemCompany,
            description: req.body.description,
            lowerLimit: req.body.lowerLimit,
            currentStock: req.body.currentStock || 0,
            purchasePrice: req.body.purchasePrice,
            retailPrice: req.body.retailPrice,
            itemDiscount: req.body.itemDiscount,
            category: req.body.category,
            itemLocation: req.body.itemLocation,
            barcode: req.body.barcode,
        });

        await newItem.save();

        res.status(201).json({ 
            message: 'Item added successfully!', 
            item: newItem 
        });
    } catch (error) {
        res.status(500).json({ error: 'Failed to add item. ' + error.message });
    }
};

exports.updateItem = async (req, res) => {
    try {
        const { id } = req.params;
        const updatedData = req.body;

        const updatedItem = await Item.findByIdAndUpdate(id, updatedData, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item updated successfully!', item: updatedItem });
    } catch (error) {
        console.error('Error updating item:', error.message);
        res.status(500).json({ error: 'Failed to update item. ' + error.message });
    }
};

// View all items
exports.getAllItems = async (req, res) => {
    try {
        const items = await Item.find();
        res.status(200).json(items);
    } catch (error) {
        console.error('Error fetching items:', error.message);
        res.status(500).json({ error: 'Failed to fetch items. ' + error.message });
    }
};

// View a single item by ID
exports.getItemById = async (req, res) => {
    try {
        const { id } = req.params;
        const item = await Item.findById(id);

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item:', error.message);
        res.status(500).json({ error: 'Failed to fetch item. ' + error.message });
    }
};

// Delete an item by ID
// Delete an item by ID
exports.deleteItem = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if the ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid item ID' });
        }

        const deletedItem = await Item.findByIdAndDelete(id);

        if (!deletedItem) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json({ message: 'Item deleted successfully!', item: deletedItem });
    } catch (error) {
        console.error('Error deleting item:', error.message);
        res.status(500).json({ error: 'Failed to delete item. ' + error.message });
    }
};

// View a single item by itemCode
exports.getItemByItemCode = async (req, res) => {
    try {
        const { itemCode } = req.params;
        const item = await Item.findOne({ itemCode });

        if (!item) {
            return res.status(404).json({ message: 'Item not found' });
        }

        res.status(200).json(item);
    } catch (error) {
        console.error('Error fetching item by code:', error.message);
        res.status(500).json({ error: 'Failed to fetch item. ' + error.message });
    }
};
