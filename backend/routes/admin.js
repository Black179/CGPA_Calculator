const express = require('express');
const router = express.Router();
const { adminLogin, getAllUsers, getUserStats, deleteUser, updateUserRole } = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Admin login (no authentication required for login)
router.post('/login', adminLogin);

// All admin routes below require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users
router.get('/users', getAllUsers);

// Get user statistics
router.get('/stats', getUserStats);

// Delete a user
router.delete('/users/:userId', deleteUser);

// Update user role
router.put('/users/:userId/role', updateUserRole);

module.exports = router;
