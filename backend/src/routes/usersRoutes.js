const express = require('express');
const router = express.Router();
const { authMiddleware, authorize } = require('../middleware/auth');
const usersController = require('../controllers/usersController');

router.use(authMiddleware);

router.get('/', authorize('admin'), usersController.getAllUsers);
router.post('/', authorize('admin'), usersController.createUser);
router.put('/:id', authorize('admin'), usersController.updateUser);
router.patch('/:id/toggle-status', authorize('admin'), usersController.toggleUserStatus);
router.patch('/:id/reset-password', authorize('admin'), usersController.resetPassword);

module.exports = router;
