const express = require('express');
const router = express.Router();
const { adminLogin, getAllUsers, getUserStats, deleteUser, updateUserRole } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin login (no authentication required for login)
router.post('/login', adminLogin);

// All admin routes below require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

router.get('/users', authenticateToken, requireAdmin, adminController.getAllUsers);
router.get('/stats', authenticateToken, requireAdmin, adminController.getStats);

// Delete a user
router.delete('/users/:userId', deleteUser);

// Update user role
router.put('/users/:userId/role', updateUserRole);

module.exports = router;
