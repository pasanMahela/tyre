// routes/userRoutes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// @route   POST /users
// @desc    Create a new user
router.post('/add', userController.createUser);

// @route   GET /users
// @desc    Get all users
router.get('/list', userController.getAllUsers);

// @route   PUT /users/:id
// @desc    Update a user by ID
router.put('/update/:id', userController.updateUser);

// @route   DELETE /users/:id
// @desc    Delete a user by ID
router.delete('/delete/:id', userController.deleteUser);

module.exports = router;
