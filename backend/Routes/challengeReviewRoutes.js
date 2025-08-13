const express = require('express');
const router = express.Router();
const {
    checkEligibility, 
    getSemester,
    getRequestFormData,
    submitRequest,
    fetchEnabledReviewTypes
} = require('../Controllers/student/challenge_review.js');

const {
    getAssignments,
    getScheduledReviews,
    scheduleReview,
    updateReviewStatus
} = require('../Controllers/common_controllers/challenge_review.js');

router.get('/assignments/:reg_num', getAssignments);
router.get('/scheduled-reviews/:reg_num', getScheduledReviews);
router.post('/schedule/:reg_num', scheduleReview);
router.patch('/:review_id/status/:reg_num', updateReviewStatus);

router.get('/eligibility/:student_reg_num/:semester/:review_type', checkEligibility);
router.get('/semester/:student_reg_num', getSemester);
router.get('/form-data/:team_id', getRequestFormData);
router.post('/submit/:semester/:student_reg_num/:team_id/:review_type', submitRequest);
router.get('/enabled-review-types', fetchEnabledReviewTypes);

module.exports = router;