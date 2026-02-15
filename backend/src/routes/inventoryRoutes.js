const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authMiddleware, authorize } = require('../middleware/auth');

// All routes require authentication
router.use(authMiddleware);

// Get all medicines
router.get('/', inventoryController.getAllMedicines);

// Get low stock medicines
router.get('/low-stock', inventoryController.getLowStock);

// Get expiring soon medicines
router.get('/expiring-soon', inventoryController.getExpiringSoon);

// Get medicine by ID
router.get('/:id', inventoryController.getMedicineById);

// Add medicine (admin/manager only)
router.post('/', authorize('admin', 'manager'), inventoryController.addMedicine);

// Update medicine (admin/manager only)
router.put('/:id', authorize('admin', 'manager'), inventoryController.updateMedicine);

// Delete medicine (admin only)
router.delete('/:id', authorize('admin'), inventoryController.deleteMedicine);

module.exports = router;
