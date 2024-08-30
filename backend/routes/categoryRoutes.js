const express = require('express');
const router = express.Router();
const Category = require('../models/Category');

// Get all categories
router.get('/view', async (req, res) => {
    try {
        const categories = await Category.find();
        res.status(200).json(categories);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new category
router.post('/add', async (req, res) => {
    const { label, value } = req.body;

    try {
        const newCategory = new Category({ label, value });
        await newCategory.save();
        res.status(201).json(newCategory);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
