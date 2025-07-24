// In your challenge_review.js controller file
const {isStudentPresentInAllReviews, 
    isChallengeReviewEnabled,
    hasExistingRequest
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
            return res.json({
                isEligible: false,
                error: "Challenge reviews are currently disabled by admin"
            });
        }

        //check is student is present is all reviews
        const isPresent = await isStudentPresentInAllReviews(student_reg_num, semester);
          if(!isPresent) {
            return res.json({
                isEligible: false,
                error: "this student is absent in one or both reviews"
            });
          }

          //check is student already has a request
          const hasRequest = await hasExistingRequest(student_reg_num, semester);
          if(hasRequest) {
            return res.json({
                isEligible: false,
                error: "You have already submitted an challenge review request for this semester"
            });
          }

          return res.json({
            isEligible: true
          });

} catch (error) {
console.log("Error checking eligibility: ", error);
return res.status(500).json({
    isEligible: false,
    error: "Internal server error"
})
};
}

module.exports = {
    checkEligibility
};