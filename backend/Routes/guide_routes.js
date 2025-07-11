const express = require('express');
const router = express.Router();
const {
    fetch_teams,
    schedule_review,
    fetch_schedules,
    updateGuideReviewStatus
} = require('../Controllers/guide/schedule_review.js');
const {  submit_s5_s6_first_ReviewMarks } = require('../Controllers/guide/award_marks.js');

// Get all teams for a guide
router.get('/:guide_reg_num/teams', fetch_teams);

// Schedule a new review
router.post('/:guide_reg_num/schedule', schedule_review);

// Get all scheduled reviews for a guide
router.get('/:guide_reg_num/schedules', fetch_schedules);

// Update review status - changed route pattern
router.patch('/:guide_reg_num/review/:reviewId/status', updateGuideReviewStatus);

router.post('/:guide_reg_num/teams/:team_id/s5_s6_first-review-marks', submit_s5_s6_first_ReviewMarks);

module.exports = router;