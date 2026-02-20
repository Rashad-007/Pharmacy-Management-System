const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/auth');
const suppliersController = require('../controllers/suppliersController');

router.use(authMiddleware);

router.get('/', suppliersController.getAllSuppliers);
router.post('/', suppliersController.createSupplier);
router.put('/:id', suppliersController.updateSupplier);
router.delete('/:id', suppliersController.deleteSupplier);

module.exports = router;
