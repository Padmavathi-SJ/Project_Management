const express = require('express');
const router = express.Router();
const { 
    getClusterStatistics,
    assignReviewersByRatio
} = require('../Controllers/admin/challenge_review.js');

// Get cluster statistics for challenge reviews
router.get('/statistics', getClusterStatistics);

// Assign reviewers by ratio
router.post('/assign', assignReviewersByRatio);

module.exports = router;