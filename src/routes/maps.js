const express = require('express');
const MapsController = require('../controllers/mapsController');

const router = express.Router();

// Get all tables
router.get('/tables', MapsController.getTables);

// Get table schema
router.get('/tables/:tableName/schema', MapsController.getTableSchema);

// Get all records from a table
router.get('/tables/:tableName', MapsController.getTableData);

// Get specific record by ID
router.get('/tables/:tableName/:id', MapsController.getRecordById);

// Execute custom SQL query
router.get('/query', MapsController.executeQuery);

module.exports = router;