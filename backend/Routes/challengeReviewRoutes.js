const express = require('express');
const router = express.Router();
const {checkEligibility, getSemester} = require('../Controllers/student/challenge_review.js');

router.get('/eligibility/:student_reg_num/:semester', checkEligibility);
router.get('/semester/:student_reg_num', getSemester);

module.exports = router;