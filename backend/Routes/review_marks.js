const express = require('express');
const router = express.Router();
const {
    fetch_average_marks,
    get_student_review_progress,
    check_challenge_review_eligibility_controller,
    check_optional_review_eligibility_controller
} = require('../Controllers/student/review_marks.js');

// Get student review progress
router.get('/review-progress/:student_reg_num/:team_id', get_student_review_progress);

// Get average marks
router.get('/average-marks/:student_reg_num/:team_id', fetch_average_marks);

// Check challenge review eligibility
router.get('/challenge-review/eligibility/:student_reg_num', check_challenge_review_eligibility_controller);

// Check optional review eligibility
router.get('/optional-review/eligibility/:student_reg_num', check_optional_review_eligibility_controller);


module.exports = router;