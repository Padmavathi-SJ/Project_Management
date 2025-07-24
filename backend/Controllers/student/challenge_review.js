// In your challenge_review.js controller file
const AttendanceModel = require('../../Models/student/challenge_review.js'); // Adjust path as needed

const checkStudentAttendance = async (req, res) => {
    try {
        const { student_reg_num, semester } = req.params;

        if (!student_reg_num || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Student registration number and semester are required'
            });
        }

        // Call the model function
        const isPresent = await AttendanceModel.isStudentPresentInAllReviews(student_reg_num, semester);
        
        res.status(200).json({
            success: true,
            isPresentInAllReviews: isPresent
        });
    } catch (error) {
        console.error('Error in checkStudentAttendance:', error);
        res.status(500).json({
            success: false,
            message: 'Error checking student attendance',
            error: error.message
        });
    }
};

module.exports = {
    checkStudentAttendance
};