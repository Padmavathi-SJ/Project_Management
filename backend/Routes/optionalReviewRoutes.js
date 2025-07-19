const express = require('express');
const router = express.Router();
const { 
  checkEligibility, 
  submitRequest, 
  fetchAllRequests, 
  updateRequest,
  getProjectByTeam
} = require('../Controllers/student/optional_review');

const {
  scheduleReview,
  getOptionalReviews,
  submitOptionalReviewMarks,
  getEligibleStudents
} = require('../Controllers/common_controllers/optional_review.js');

const {
  updateGuideReviewStatusController
} = require('../Controllers/guide/optional_review.js');

const {
  updateSubExpertReviewStatusController
} = require('../Controllers/sub_expert/optional_review.js');

// Debug middleware (temporary)
router.use((req, res, next) => {
  console.log(`[${req.method}] ${req.originalUrl}`);
  next();
});

//award marks for optional reviews
// For guide submissions
router.post(
    '/guide/:reg_num/team/:team_id/submit-optional-marks',
    submitOptionalReviewMarks
);

// For sub-expert submissions
router.post(
    '/sub-expert/:reg_num/team/:team_id/submit-optional-marks',
    submitOptionalReviewMarks
);

// Student routes
router.get('/eligibility/:reg_num', checkEligibility);
router.post('/post-request', submitRequest);
router.get('/projects/team/:team_id', getProjectByTeam);

router.post('/schedule_review/:user_reg_num', scheduleReview);
router.get('/get_scheduled_reviews/:user_reg_num', getOptionalReviews)
router.patch('/guide/:review_id/status/:guide_reg_num',  updateGuideReviewStatusController);
router.patch(
  '/sub_expert/:review_id/status/:sub_expert_reg_num',
  updateSubExpertReviewStatusController
);
router.get('/team/:team_id/eligible-students', getEligibleStudents);

// Admin routes
router.get('/requests', fetchAllRequests);
router.put('/request/:request_id', updateRequest);

module.exports = router;