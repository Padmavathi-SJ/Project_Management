const express = require('express');
const router = express.Router();
const {
    fetch_teams,
    schedule_review,
    fetch_schedules
} = require('../Controllers/sub_expert/schedule_review.js');

// Get all teams for a sub-expert
router.get('/sub-expert/:sub_expert_reg_num/teams', fetch_teams);

// Schedule a new review
router.post('/sub-expert/:sub_expert_reg_num/schedule', schedule_review);

// Get all scheduled reviews for a sub-expert
router.get('/sub-expert/:sub_expert_reg_num/schedules', fetch_schedules);

module.exports = router;