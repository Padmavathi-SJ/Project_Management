const express = require('express');
const router = express.Router();
const {fetch_guide_reviews_by_team, fetch_sub_expert_reviews_by_team} = require('../Controllers/student/review_schedule.js');

// Guide review schedules by team_id
router.get('/reviews/guide-reviews/:team_id', fetch_guide_reviews_by_team);

// Sub-expert review schedules by team_id
router.get('/reviews/sub-expert-reviews/:team_id', fetch_sub_expert_reviews_by_team);

module.exports = router;