const { 
  getRequestsByUser,
  updateRequestStatusModel,
  scheduleOptionalReview,
  getApprovedOptionalRequests,
  getRequestDetailsById,
  getStudentsForScheduling
} = require('../../Models/guide/optional_review.js');

// Get optional review requests
const getOptionalReviewRequests = async (req, res) => {
  try {
    const { user_reg_num } = req.params;
    
    const { requests, userType } = await getRequestsByUser(user_reg_num);

    if (!userType) {
      return res.status(404).json({
        status: false,
        error: "No requests found for this user"
      });
    }

    return res.json({
      status: true,
      data: requests,
      userType
    });

  } catch (error) {
    console.error("Error fetching review requests:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error"
    });
  }
};

// Update request status
const updateRequestStatus = async (req, res) => {
  try {
    const { request_id } = req.params;
    const { status, rejection_reason } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: "Invalid status. Must be 'approved' or 'rejected'"
      });
    }

    if (status === 'rejected' && !rejection_reason) {
      return res.status(400).json({
        status: false,
        error: "Rejection reason is required when rejecting a request"
      });
    }

    const updatedRequest = await updateRequestStatusModel(
      request_id,
      status,
      rejection_reason
    );

    if (!updatedRequest) {
      return res.status(404).json({
        status: false,
        error: "Request not found"
      });
    }

    return res.json({
      status: true,
      message: "Request status updated successfully",
      updatedRequest
    });

  } catch (error) {
    console.error("Error updating request:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error"
    });
  }
};

const getStudentsForReview = async (req, res) => {
  try {
    const { user_reg_num } = req.params;

    const { students, userType } = await getStudentsForScheduling(user_reg_num);

    if (!userType) {
      return res.status(404).json({
        status: false,
        error: "No approved requests found for this user"
      });
    }

    return res.json({
      status: true,
      user_type: userType,
      data: students
    });

  } catch (error) {
    console.error("Error fetching students:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
};


module.exports = {
  getOptionalReviewRequests,
  updateRequestStatus,
  getStudentsForReview
};