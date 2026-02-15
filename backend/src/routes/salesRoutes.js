const express = require('express');
const router = express.Router();
const salesController = require('../controllers/salesController');
const { authMiddleware } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Create sale
router.post('/', salesController.createSale);

// Get all sales
router.get('/', salesController.getAllSales);

// Get sale by ID
router.get('/:id', salesController.getSaleById);

module.exports = router;
