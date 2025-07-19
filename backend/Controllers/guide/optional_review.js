const { 
  getRequestsByUser,
  updateRequestStatusModel,
  getApprovedOptionalRequests,
  getGuideStudents,
  updateGuideReviewStatus, 
  getGuideReviewById
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

const getGuideStudentsForReview = async (req, res) => {
  try {
    const { user_reg_num } = req.params;

    const students = await getGuideStudents(user_reg_num);

    if (students.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No approved requests found for this guide"
      });
    }

    return res.json({
      status: true,
      user_type: 'guide',
      data: students
    });

  } catch (error) {
    console.error("Error fetching guide students:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
};


const updateGuideReviewStatusController = async (req, res) => {
  try {
    const { review_id, guide_reg_num } = req.params;
    const { status } = req.body;

    if (!['Completed', 'Not completed', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid status value'
      });
    }

    await updateGuideReviewStatus(review_id, guide_reg_num, status);
    const updatedReview = await getGuideReviewById(review_id, guide_reg_num);

    res.json({
      status: true,
      message: 'Guide review status updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating guide review status:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: false,
      error: error.message
    });
  }
};


module.exports = {
  getOptionalReviewRequests,
  updateRequestStatus,
  getGuideStudentsForReview,
  updateGuideReviewStatusController
};