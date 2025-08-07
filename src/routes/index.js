const express = require('express');
const mapsRoutes = require('./maps');
const healthRoutes = require('./health');

const router = express.Router();

// Mount routes
router.use('/api', mapsRoutes);
router.use('/health', healthRoutes);

module.exports = router;