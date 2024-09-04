// routes/saleRoutes.js
const express = require('express');
const router = express.Router();
const saleController = require('../controllers/saleController');

// POST /api/sales
router.post('/sales', saleController.createSale);

module.exports = router;
