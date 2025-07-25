const express = require('express');
const router = express.Router();
const {checkEligibility, 
    getSemester,
    getRequestFormData,
    submitRequest} = require('../Controllers/student/challenge_review.js');

router.get('/eligibility/:student_reg_num/:semester', checkEligibility);
router.get('/semester/:student_reg_num', getSemester);

router.get('/form-data/:team_id', getRequestFormData);
router.post('/submit/:semester/:student_reg_num/:team_id/:review_type', submitRequest);

module.exports = router;