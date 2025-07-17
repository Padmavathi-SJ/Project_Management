const { 
    isOptionalReviewEnabled,
    isStudentAbsent,
    hasExistingRequest,
    createRequest,
    getAllRequests,
    updateRequestStatus
} = require('../../Models/student/optional_review.js');

const submitRequest = async (req, res) => {
    const { 
        team_id, project_id, semester, review_type,
        student_reg_num, guide_reg_num, sub_expert_reg_num,
        request_reason 
    } = req.body;

    try {
        // 1. Check if optional reviews are enabled
        const isEnabled = await isOptionalReviewEnabled();
        if (!isEnabled) {
            return res.status(403).json({
                status: false,
                error: "Optional reviews are currently disabled by admin"
            });
        }

        // 2. Validate required fields
        if (!team_id || !project_id || !semester || !review_type || 
            !student_reg_num || !guide_reg_num || !sub_expert_reg_num || 
            !request_reason) {
            return res.status(400).json({
                status: false,
                error: "All fields are required"
            });
        }

        // 3. Check if student is absent in both evaluations
        const isAbsent = await isStudentAbsent(
            student_reg_num, 
            semester, 
            review_type
        );
        
        if (!isAbsent) {
            return res.status(400).json({
                status: false,
                error: "Optional review only available for students absent in both evaluations"
            });
        }

        // 4. Check if student already has a request this semester
        const hasRequest = await hasExistingRequest(
            student_reg_num, 
            semester
        );
        
        if (hasRequest) {
            return res.status(400).json({
                status: false,
                error: "You can only request one optional review per semester"
            });
        }

        // 5. Create the request
        const requestData = {
            team_id,
            project_id,
            semester,
            review_type,
            student_reg_num,
            guide_reg_num,
            sub_expert_reg_num,
            request_reason
        };
        
        await createRequest(requestData);

        return res.json({
            status: true,
            message: "Optional review request submitted successfully"
        });

    } catch (error) {
        console.error("Error submitting optional review request:", error);
        return res.status(500).json({
            status: false,
            error: "Internal server error"
        });
    }
};

const fetchAllRequests = async (req, res) => {
    try {
        const requests = await getAllRequests();
        return res.json({
            status: true,
            requests
        });
    } catch (error) {
        console.error("Error fetching optional review requests:", error);
        return res.status(500).json({
            status: false,
            error: "Internal server error"
        });
    }
};

const updateRequest = async (req, res) => {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;

    try {
        if (!request_id || !status) {
            return res.status(400).json({
                status: false,
                error: "Request ID and status are required"
            });
        }

        if (status === 'rejected' && !rejection_reason) {
            return res.status(400).json({
                status: false,
                error: "Rejection reason is required when rejecting a request"
            });
        }

        await updateRequestStatus(
            request_id, 
            status, 
            rejection_reason
        );

        return res.json({
            status: true,
            message: "Request status updated successfully"
        });

    } catch (error) {
        console.error("Error updating request status:", error);
        return res.status(500).json({
            status: false,
            error: "Internal server error"
        });
    }
};

module.exports = {
    submitRequest,
    fetchAllRequests,
    updateRequest
};