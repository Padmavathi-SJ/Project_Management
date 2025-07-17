// optionalReviewRoutes.js
const express = require('express');
const router = express.Router();
const { submitRequest, fetchAllRequests, updateRequest } = require('../Controllers/student/optional_review.js');

// Student routes
router.post('/post-request', submitRequest);

// Admin routes
router.get('/requests', fetchAllRequests);
router.put('/request/:request_id', updateRequest);

module.exports = router;