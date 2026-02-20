const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

router.use(authMiddleware);

router.get('/daily-sales', analyticsController.getDailySales);
router.get('/top-medicines', analyticsController.getTopMedicines);
router.get('/category-stock', analyticsController.getCategoryStock);
router.get('/recent-sales', analyticsController.getRecentSales);
router.get('/summary', analyticsController.getSummaryStats);

module.exports = router;
