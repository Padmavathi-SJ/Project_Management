// routes/guide/marks.js
const express = require('express');
const router = express.Router();
const { getTeamMembers, submit_marks } = require('../Controllers/guide/award_marks.js');

// Get team members
router.get('/team/:team_id/members', getTeamMembers);

// For guide submissions
router.post('/guide/:reg_num/team/:team_id/submit-marks', submit_marks);

// For sub-expert submissions
router.post('/sub-expert/:reg_num/team/:team_id/submit-marks', submit_marks);

module.exports = router;