const express = require('express');
const router = express.Router();
const exportController = require('../Controllers/admin/export_data.js');


// Export data route
router.post('/export', exportController.exportData);

// Get filter options route
router.get('/filter-options', exportController.getFilterOptions);

module.exports = router;