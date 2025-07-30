const {
    isChallengeReviewEnabled,
    hasExistingRequest,
    checkReviewTypeAttendance,
    fetchSemester,
    getProjectDetails,
    getTeamDetails,
    submitChallengeReviewRequest,
    getEnabledReviewTypes
} = require('../../Models/student/challenge_review.js');

const checkEligibility = async (req, res) => {
    const {student_reg_num, semester, review_type} = req.params;

    if (!student_reg_num || !semester || !review_type) {
        return res.status(400).json({
            success: false,
            message: 'Student registration number, semester and review type are required'
        });
    }

    try {
        // Check if challenge reviews are enabled for this review type
        const isEnabled = await isChallengeReviewEnabled(review_type);
        if (!isEnabled) {
            return res.status(403).json({
                isEligible: false,
                error: `Challenge reviews are currently disabled for ${review_type} by admin`
            });
        }

        // Check for existing request
        const hasRequest = await hasExistingRequest(student_reg_num, semester);
        if (hasRequest) {
            return res.status(400).json({
                isEligible: false,
                error: `You have already submitted a challenge review request for this semester. Only one allowed.`
            });
        }

        // Check attendance only for the requested review type
        const isPresent = await checkReviewTypeAttendance(student_reg_num, semester, review_type);
        if(!isPresent) {
            return res.status(400).json({
                isEligible: false,
                error: `This student is absent in ${review_type} review`
            });
        }

        return res.json({
            isEligible: true,
            message: "Student is eligible for challenge review"
        });

    } catch (error) {
        console.error("Error checking eligibility: ", error);
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

        // Check if challenge review is enabled for this review type
        const isEnabled = await isChallengeReviewEnabled(review_type);
        if (!isEnabled) {
            return res.status(403).json({
                success: false,
                message: `Challenge reviews are currently disabled for ${review_type} by admin`
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


const fetchEnabledReviewTypes = async (req, res) => {
    try {
        const enabledTypes = await getEnabledReviewTypes();
        
        res.status(200).json({
            success: true,
            enabledReviewTypes: enabledTypes,
            review1Enabled: enabledTypes.includes('review-1'),
            review2Enabled: enabledTypes.includes('review-2')
        });
    } catch (error) {
        console.error('Error fetching enabled review types:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch enabled review types'
        });
    }
};



module.exports = {
    checkEligibility,
    getSemester,
    getRequestFormData,
    submitRequest,
    fetchEnabledReviewTypes
};