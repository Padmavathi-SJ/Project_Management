// guide_routes.js
const express = require('express');
const router = express.Router();
const {
    fetch_teams,
    schedule_review,
    fetch_schedules,
    updateGuideReviewStatus
} = require('../Controllers/guide/schedule_review.js');

const { getOptionalReviewRequests, 
    updateRequestStatus,
    getGuideStudentsForReview } = require('../Controllers/guide/optional_review.js');

// Debug middleware
router.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// Optional review requests route
router.get('/optional_review_requests/:user_reg_num', getOptionalReviewRequests);
router.patch('/optional_review_requests/:request_id/status',  updateRequestStatus);

// Scheduling routes
router.get('/students_for_review/:user_reg_num', getGuideStudentsForReview);

// Update review status
router.patch('/:guide_reg_num/review/:reviewId/status', updateGuideReviewStatus);

// Other routes
router.get('/:guide_reg_num/teams', fetch_teams);
router.post('/:guide_reg_num/schedule', schedule_review);
router.get('/:guide_reg_num/schedules', fetch_schedules);
router.patch('/optional_review_requests/:request_id/status',  updateRequestStatus
);

module.exports = router;