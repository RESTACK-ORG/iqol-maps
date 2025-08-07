const express = require('express');
const HealthController = require('../controllers/healthController');

const router = express.Router();

// Health check endpoint
router.get('/', HealthController.checkHealth);

module.exports = router;