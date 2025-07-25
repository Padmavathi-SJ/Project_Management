// In your challenge_review.js controller file
const {isStudentPresentInAllReviews, 
    isChallengeReviewEnabled,
    hasExistingRequest,
    fetchSemester,
    getProjectDetails,
    getTeamDetails,
    submitChallengeReviewRequest
} = require('../../Models/student/challenge_review.js'); // Adjust path as needed


const checkEligibility = async (req, res) => {
    const {student_reg_num, semester} = req.params;

    if (!student_reg_num || !semester) {
        return res.status(400).json({
            success: false,
            message: 'Student registration number, semester are required'
        });
    }

    try {
        // Check if challenge reviews are enabled
        const isEnabled = await isChallengeReviewEnabled();
        if (!isEnabled) {
            return res.status(403).json({
                isEligible: false,
                error: "Challenge reviews are currently disabled by admin"
            });
        }

        // Check student attendance
        const isPresent = await isStudentPresentInAllReviews(student_reg_num, semester);
        if(!isPresent) {
            return res.status(400).json({
                isEligible: false,
                error: "This student is absent in one or both reviews"
            });
        }

        // Check for existing request (now includes review_type)
        const hasRequest = await hasExistingRequest(student_reg_num, semester);
       if (hasRequest) {
    return res.status(400).json({
        isEligible: false,
        error: `You have already submitted a challenge review request for this semester. Only one allowed.`
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
        });
    }
};
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

const getRequestFormData = async (req, res) => {
    const { team_id } = req.params;

    try {
        const [projectDetails, teamDetails] = await Promise.all([
            getProjectDetails(team_id),
            getTeamDetails(team_id)
        ]);

        if (!projectDetails || !teamDetails) {
            return res.status(404).json({
                success: false,
                message: 'Team or project details not found'
            });
        }

        res.status(200).json({
            success: true,
            data: {
                project_id: projectDetails.project_id,
                project_type: projectDetails.project_type,
                cluster: projectDetails.cluster,
                guide_reg_num: teamDetails.guide_reg_num,
                sub_expert_reg_num: teamDetails.sub_expert_reg_num
            }
        });

    } catch (err) {
        console.error('Error fetching form data:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch form data'
        });
    }
};


// Submit challenge review request
const submitRequest = async (req, res) => {
    const { semester, student_reg_num, team_id, review_type } = req.params;
    const { request_reason } = req.body;

    try {
        // Validate required fields
        if (!request_reason) {
            return res.status(400).json({
                success: false,
                message: 'Request reason is required'
            });
        }

        // Get all required data
        const [projectDetails, teamDetails] = await Promise.all([
            getProjectDetails(team_id),
            getTeamDetails(team_id)
        ]);

        if (!projectDetails || !teamDetails) {
            return res.status(404).json({
                success: false,
                message: 'Team or project details not found'
            });
        }

        // Prepare request data
        const requestData = {
            team_id,
            project_id: projectDetails.project_id,
            project_type: projectDetails.project_type,
            cluster: projectDetails.cluster,
            semester,
            review_type,
            student_reg_num,
            guide_reg_num: teamDetails.guide_reg_num,
            sub_expert_reg_num: teamDetails.sub_expert_reg_num,
            request_reason
        };

        // Submit request
        await submitChallengeReviewRequest(requestData);

        res.status(201).json({
            success: true,
            message: 'Challenge review request submitted successfully'
        });

    } catch (err) {
        console.error('Error submitting request:', err);
        res.status(500).json({
            success: false,
            message: 'Failed to submit challenge review request'
        });
    }
};

module.exports = {
    checkEligibility,
    getSemester,
    getRequestFormData,
    submitRequest
};