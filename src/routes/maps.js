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


router.get('/urban', MapsController.getUrbanGeoJSON);
router.get('/bbmp', MapsController.getBBMPGeoJSON);
router.get('/rural', MapsController.getRuralGEOJSON);
router.get('/nice', MapsController.getNICEGEOJSON);
router.get('/orr', MapsController.getORRGEOJSON);
router.get('/peripheral', MapsController.getPeripheralGEOJSON);
router.get('/strr-proposed', MapsController.getSTRRProposedGEOJSON);
router.get('/strr', MapsController.getSTRRGEOJSON);
router.get('/hightension', MapsController.gethightensionGEOJSON);
router.get('/metro', MapsController.getMetroGeoJSON);
router.get('/suburb_railway', MapsController.getSuburbanGeoJSON);


module.exports = router;