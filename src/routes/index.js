const express = require('express');
const mapsRoutes = require('./maps');
const healthRoutes = require('./health');
const tileRoutes = require('./tiles');



const router = express.Router();

// Mount routes
router.use('/api', mapsRoutes);
router.use('/health', healthRoutes);
router.use('/', tileRoutes);



module.exports = router;