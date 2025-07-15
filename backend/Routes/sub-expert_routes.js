const express = require('express');
const router = express.Router();
const {
    fetch_teams,
    schedule_review,
    fetch_schedules,
    updateSubExpertReviewStatus
} = require('../Controllers/sub_expert/schedule_review.js');

// Get all teams for a sub-expert
router.get('/:sub_expert_reg_num/teams', fetch_teams);

// Schedule a new review
router.post('/:sub_expert_reg_num/schedule', schedule_review);

// Get all scheduled reviews for a sub-expert
router.get('/:sub_expert_reg_num/schedules', fetch_schedules);

// Update review status
router.patch('/:sub_expert_reg_num/review/:reviewId/status', updateSubExpertReviewStatus);

module.exports = router;