const express = require('express');
const router = express.Router();
const {fetch_guide_reviews_by_team, fetch_sub_expert_reviews_by_team} = require('../Controllers/student/review_schedule.js');
const { fetch_average_marks,  get_student_review_progress} = require('../Controllers/student/review_marks.js');
const ProjectController = require('../Controllers/student/projects.js');

// Guide review schedules by team_id
router.get('/reviews/guide-reviews/:team_id', fetch_guide_reviews_by_team);

// Sub-expert review schedules by team_id
router.get('/reviews/sub-expert-reviews/:team_id', fetch_sub_expert_reviews_by_team);

router.get('/:student_reg_num/:team_id/average-marks', fetch_average_marks);

router.get('/review-progress/:student_reg_num/:team_id', get_student_review_progress);

// Get project form data
router.get('/:team_id/form-data', ProjectController.getProjectFormData);

// Create new project
router.post('/:team_id/create',  ProjectController.createProject);

module.exports = router;