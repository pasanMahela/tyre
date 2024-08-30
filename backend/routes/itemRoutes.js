const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');

// Route to add a new item
router.post('/add', itemController.addItem);

// Route to update an existing item
router.put('/update/:id', itemController.updateItem);

// Route to get all items
router.get('/list', itemController.getAllItems);

// Route to get a single item by ID
router.get('/view/:id', itemController.getItemById);

// Route to delete an item by ID
router.delete('/delete/:id', itemController.deleteItem);

// Route to get a single item by itemCode
router.get('/view/code/:itemCode', itemController.getItemByItemCode);

module.exports = router;
