const { 
    isOptionalReviewEnabled,
    verifyTeamMembership,
    getTeamDetails,
    isStudentAbsent,
    hasExistingRequest,
    createRequest,
    getAllRequests,
    updateRequestStatus
} = require('../../Models/student/optional_review.js');

// In your optional_review controller
const checkEligibility = async (req, res) => {
  const { reg_num } = req.params;
  const { semester, review_type } = req.query;

  try {
    // 1. Check if optional reviews are enabled
    const isEnabled = await isOptionalReviewEnabled();
    if (!isEnabled) {
      return res.json({
        isEligible: false,
        error: "Optional reviews are currently disabled by admin"
      });
    }

    // 2. Check if student is absent in both evaluations
    const isAbsent = await isStudentAbsent(reg_num, semester, review_type);
    if (!isAbsent) {
      return res.json({
        isEligible: false,
        error: "You must be absent in both evaluations to request an optional review"
      });
    }

    // 3. Check if student already has a request
    const hasRequest = await hasExistingRequest(reg_num, semester);
    if (hasRequest) {
      return res.json({
        isEligible: false,
        error: "You have already submitted an optional review request for this semester"
      });
    }

    return res.json({
      isEligible: true
    });

  } catch (error) {
    console.error("Error checking eligibility:", error);
    return res.status(500).json({
      isEligible: false,
      error: "Internal server error"
    });
  }
};

// In your backend controller (optional_review.js)
const submitRequest = async (req, res) => {
  console.log("Received request body:", req.body); // Log incoming data
  
  try {
    const { team_id, semester, review_type, student_reg_num, request_reason } = req.body;

    // Validate required fields
    if (!team_id || !semester || !review_type || !student_reg_num || !request_reason) {
      console.log("Missing fields in request");
      return res.status(400).json({
        status: false,
        error: "All fields are required"
      });
    }

    // Check if optional reviews are enabled
    const isEnabled = await isOptionalReviewEnabled();
    if (!isEnabled) {
      return res.status(403).json({
        status: false,
        error: "Optional reviews are currently disabled by admin"
      });
    }

    // Verify team membership
    const isTeamMember = await verifyTeamMembership(team_id, student_reg_num);
    if (!isTeamMember) {
      return res.status(403).json({
        status: false,
        error: "Student is not a member of this team"
      });
    }

    // Check attendance
    const isAbsent = await isStudentAbsent(student_reg_num, semester, review_type);
    if (!isAbsent) {
      return res.status(400).json({
        status: false,
        error: "Student must be absent in both evaluations"
      });
    }

    // Check for existing request
    const hasRequest = await hasExistingRequest(student_reg_num, semester);
    if (hasRequest) {
      return res.status(400).json({
        status: false,
        error: "Existing request found for this semester"
      });
    }

    // Get team details
    const teamDetails = await getTeamDetails(team_id);
    if (!teamDetails) {
      return res.status(404).json({
        status: false,
        error: "Team not found"
      });
    }

    // Create request
    const requestData = {
      team_id,
      project_id: teamDetails.project_id,
      semester,
      review_type,
      student_reg_num,
      guide_reg_num: teamDetails.guide_reg_num,
      sub_expert_reg_num: teamDetails.sub_expert_reg_num || '',
      request_reason
    };

    await createRequest(requestData);

    return res.json({
      status: true,
      message: "Optional review request submitted successfully"
    });

  } catch (error) {
    console.error("Error in submitRequest:", error);
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

// Controllers/student/optional_review.js
const getProjectByTeam = async (req, res) => {
  try {
    const { team_id } = req.params;
    const teamDetails = await getTeamDetails(team_id);
    
    if (!teamDetails) {
      return res.status(404).json({ error: "Team not found" });
    }

    return res.json({
      project_id: teamDetails.project_id,
      project_name: teamDetails.project_name,
      guide_reg_num: teamDetails.guide_reg_num,
      sub_expert_reg_num: teamDetails.sub_expert_reg_num,
      semester: teamDetails.semester
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};



module.exports = {
    checkEligibility,
    submitRequest,
    fetchAllRequests,
    updateRequest,
    getProjectByTeam
};