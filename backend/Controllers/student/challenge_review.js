// In your challenge_review.js controller file
const {isStudentPresentInAllReviews, 
    isChallengeReviewEnabled,
    hasExistingRequest,
    fetchSemester
} = require('../../Models/student/challenge_review.js'); // Adjust path as needed


const checkEligibility = async (req, res) => {
    const {student_reg_num, semester} = req.params;

        if (!student_reg_num || !semester) {
            return res.status(400).json({
                success: false,
                message: 'Student registration number and semester are required'
            });
        }
    
    try {
        //check if challenge reviews are enabled
        const isEnabled = await isChallengeReviewEnabled();
        if (!isEnabled) {
            return res.status(403).json({
                isEligible: false,
                error: "Challenge reviews are currently disabled by admin"
            });
        }

        //check is student is present is all reviews
        const isPresent = await isStudentPresentInAllReviews(student_reg_num, semester);
          if(!isPresent) {
            return res.status(400).json({
                isEligible: false,
                error: "this student is absent in one or both reviews"
            });
          }

          //check is student already has a request
          const hasRequest = await hasExistingRequest(student_reg_num, semester);
          if(hasRequest) {
            return res.status(400).json({
                isEligible: false,
                error: "You have already submitted an challenge review request for this semester"
            });
          }

          return res.json({
            isEligible: true,
            message: "Student is eligible for challenge review"
          });

} catch (error) {
console.log("Error checking eligibility: ", error);
return res.status(500).json({
    isEligible: false,
    error: "Internal server error"
})
};
}

const getSemester = async (req, res) => {
    const { student_reg_num } = req.params;
    
    if (!student_reg_num) {
        return res.status(400).json({
            success: false,
            message: 'Student registration number is required'
        });
    }

    try {
        const semester = await fetchSemester(student_reg_num);
        
        if (!semester) {
            return res.status(404).json({
                success: false,
                message: 'No valid semester found for this student (must be 5-8)'
            });
        }

        return res.status(200).json({
            success: true,
            semester: semester
        });

    } catch (err) {
        console.error('Error fetching semester:', err);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
};

module.exports = {
    checkEligibility,
    getSemester
};