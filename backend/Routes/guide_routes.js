const express = require('express');
const router = express.Router();
const {
    fetch_teams,
    schedule_review,
    fetch_schedules
} = require('../Controllers/guide/schedule_review.js');

// Get all teams for a guide
router.get('/:guide_reg_num/teams', fetch_teams);

// Schedule a new review
router.post('/:guide_reg_num/schedule', schedule_review);

// Get all scheduled reviews for a guide
router.get('/:guide_reg_num/schedules', fetch_schedules);

module.exports = router;