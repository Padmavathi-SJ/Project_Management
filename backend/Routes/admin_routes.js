const express = require('express');
const router = express.Router();
const { getReviewStatistics, assignReviewersByRatio } = require('../Controllers/admin/challenge_review.js');

// Get challenge review statistics
router.get('/challenge-review-assignment/statistics', getReviewStatistics);

// Assign reviewers by ratio
router.post('/challenge-review-assignment/assign', assignReviewersByRatio);

module.exports = router;