const express = require('express');
const router = express.Router();
const { submit_marks } = require('../Controllers/guide/award_marks.js');

// For guide submissions
router.post('/guide/:reg_num/team/:team_id/submit-marks', submit_marks);

// For sub-expert submissions
router.post('/sub-expert/:reg_num/team/:team_id/submit-marks', submit_marks);

module.exports = router;