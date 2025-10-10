const express = require('express');
const router = express.Router();
const { register, login, verifyToken } = require('../controllers/authController');

// Register new user
router.post('/register', register);

// Login user
router.post('/login', login);

// Verify token
router.get('/verify', verifyToken);

module.exports = router;
