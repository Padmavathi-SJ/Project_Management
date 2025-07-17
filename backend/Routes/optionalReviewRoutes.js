const express = require('express');
const router = express.Router();
const { 
  checkEligibility, 
  submitRequest, 
  fetchAllRequests, 
  updateRequest,
  getProjectByTeam
} = require('../Controllers/student/optional_review');

// Debug middleware (temporary)
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

// Student routes
router.get('/eligibility/:reg_num', checkEligibility);
router.post('/post-request', submitRequest);
router.get('/projects/team/:team_id', getProjectByTeam);

// Admin routes
router.get('/requests', fetchAllRequests);
router.put('/request/:request_id', updateRequest);

module.exports = router;