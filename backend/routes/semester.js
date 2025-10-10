const express = require('express');
const router = express.Router();
const { saveSemesterData, getSemesterData } = require('../controllers/semesterController');
const { authenticateToken } = require('../middleware/auth');

// Save semester data
router.post('/save', authenticateToken, saveSemesterData);

// Get semester data
router.get('/data', authenticateToken, getSemesterData);

module.exports = router;
