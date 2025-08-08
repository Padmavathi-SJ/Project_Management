const express = require('express');
const router = express.Router();
const {
    getAssignmentStatus,
    assignReviewersBatch,
    getClusterPendingRequests,
    getClusterAvailableStaff
} = require('../Controllers/admin/challenge_review.js');

// Get current assignment status
router.get('/status', getAssignmentStatus);

// Assign reviewers to requests with admin-selected ratio
router.post('/assign', assignReviewersBatch);

// Get pending requests for a cluster
router.get('/cluster-requests/:cluster', getClusterPendingRequests);

// Get available staff for a cluster
router.get('/cluster-staff/:cluster', getClusterAvailableStaff);

module.exports = router;