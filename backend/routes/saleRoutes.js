// backend/routes/sales.js
const express = require('express');
const router = express.Router();
const salesController = require('../controllers/saleController');

router.post('/', salesController.createSale);  // Create new sale
router.get('/', salesController.getSales);      // Get all sales

module.exports = router;
