const express = require('express');
const router = express.Router();
const {
    fetch_regular_reviews_by_team,
    fetch_upcoming_regular_reviews
} = require('../Controllers/student/review_schedule.js');
const { fetch_average_marks,  get_student_review_progress} = require('../Controllers/student/review_marks.js');
const ProjectController = require('../Controllers/student/projects.js');

// Regular review schedules by team_id
router.get('/reviews/regular/:team_id', fetch_regular_reviews_by_team);

// Upcoming regular reviews by team_id
router.get('/reviews/regular/upcoming/:team_id', fetch_upcoming_regular_reviews);

router.get('/:student_reg_num/:team_id/average-marks', fetch_average_marks);

router.get('/review-progress/:student_reg_num/:team_id', get_student_review_progress);

// Get project form data
router.get('/:team_id/form-data', ProjectController.getProjectFormData);

// Create new project
router.post('/:team_id/create',  ProjectController.createProject);

module.exports = router;