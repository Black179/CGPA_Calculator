const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { authenticateToken } = require('../middleware/auth');

// Get user profile
router.get('/profile', authenticateToken, getProfile);

// Update user profile
router.put('/profile', authenticateToken, updateProfile);

module.exports = router;
