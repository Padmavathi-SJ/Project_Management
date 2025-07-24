const express = require('express');
const router = express.Router();
const {checkEligibility} = require('../Controllers/student/challenge_review.js');

router.get('/eligibility/:student_reg_num/:semester', checkEligibility);

module.exports = router;