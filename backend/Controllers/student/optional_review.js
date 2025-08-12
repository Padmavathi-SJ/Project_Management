const { 
    isOptionalReviewEnabled,
    verifyTeamMembership,
    getTeamDetails,
    getEligibleReviews,
     isStudentAbsentInAnyReview,
    hasExistingRequest,
    createRequest,
    getAllRequests,
    updateRequestStatus
} = require('../../Models/student/optional_review.js');


const checkEligibility = async (req, res) => {
  const { reg_num } = req.params;
  const { semester } = req.query;

  try {
    console.log(`Checking eligibility for ${reg_num} in semester ${semester}`);
    
    // 1. Check if optional reviews are enabled
    const isEnabled = await isOptionalReviewEnabled();
    console.log(`Optional reviews enabled: ${isEnabled}`);
    
    if (!isEnabled) {
      return res.json({
        isEnabled: false,
        isEligible: false,
        error: "Optional reviews are currently disabled by admin"
      });
    }

    // 2. Check if student is absent in any review
    const isAbsent = await isStudentAbsentInAnyReview(reg_num, semester);
    console.log(`Student absent in any review: ${isAbsent}`);
    
    if (!isAbsent) {
      return res.json({
        isEnabled: true,
        isEligible: false,
        error: "You must be absent in at least one review to request an optional review"
      });
    }

    // 3. Check if student already has a request this semester
    const hasRequest = await hasExistingRequest(reg_num, semester);
    console.log(`Existing request found: ${hasRequest}`);
    
    if (hasRequest) {
      return res.json({
        isEnabled: true,
        isEligible: false,
        error: "You can only submit one optional review request per semester"
      });
    }

    console.log(`Student is eligible for optional review`);
    return res.json({
      isEnabled: true,
      isEligible: true
    });

  } catch (error) {
    console.error("Error checking eligibility:", error);
    return res.status(500).json({
      isEnabled: false,
      isEligible: false,
      error: "Internal server error"
    });
  }
};

const fetchEligibleReviews = async (req, res) => {
  const { student_reg_num } = req.params;  // Changed from reg_num to match route
  const { semester } = req.query;
  
  try {
    const eligibleReviews = await getEligibleReviews(student_reg_num, semester);
    res.json({ eligibleReviews });
  } catch (error) {
    console.error("Error fetching eligible reviews:", error);
    res.status(500).json({ 
      error: "Internal server error",
      details: error.message 
    });
  }
};

const submitRequest = async (req, res) => {
  console.log("Received request body:", req.body);
  
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

    // Check if student is absent in the selected review type
    const isAbsent = await isStudentAbsentInAnyReview(student_reg_num, semester, review_type);
    if (!isAbsent) {
      return res.status(400).json({
        status: false,
        error: `You must be absent in ${review_type === 'review-1' ? 'First' : 'Second'} Review to request this optional review`
      });
    }

    // Check for existing request in this semester
    const hasRequest = await hasExistingRequest(student_reg_num, semester);
    if (hasRequest) {
      return res.status(400).json({
        status: false,
        error: "You can only submit one optional review request per semester"
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
    fetchEligibleReviews,
    submitRequest,
    fetchAllRequests,
    updateRequest,
    getProjectByTeam
};