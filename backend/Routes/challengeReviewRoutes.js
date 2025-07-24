const express = require('express');
const router = express.Router();
const attendanceController = require('../Controllers/student/challenge_review.js');

router.get('/:student_reg_num/:semester', attendanceController.checkStudentAttendance);

module.exports = router;