const {
    getRequestDetailsById,
    scheduleOptionalReview
} = require('../../Models/common_models/optional_review.js');

const scheduleReview = async (req, res) => {
  try {
    const { user_reg_num } = req.params;
    const { request_id, venue, date, time, meeting_link } = req.body;

    // Validate required fields
    if (!request_id || !date || !time) {
      return res.status(400).json({
        status: false,
        error: "Request ID, date, and time are required"
      });
    }

    // Get request details
    const request = await getRequestDetailsById(request_id);
    if (!request) {
      return res.status(404).json({
        status: false,
        error: "Request not found or not approved"
      });
    }

    // Determine user type and verify authorization
    let userType = null;
    if (request.guide_reg_num === user_reg_num) {
      userType = 'guide';
    } else if (request.sub_expert_reg_num === user_reg_num) {
      userType = 'sub_expert';
    } else {
      return res.status(403).json({
        status: false,
        error: "You are not authorized to schedule this review"
      });
    }

    // Prepare review data
    const reviewData = {
      review_id: `OR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_reg_num: request.student_reg_num,
      sub_expert_reg_num: request.sub_expert_reg_num,
      guide_reg_num: request.guide_reg_num,
      team_id: request.team_id,
      project_id: request.project_id,
      semester: request.semester,
      review_type: request.review_type,
      venue: venue || 'To be determined',
      date,
      time,
      meeting_link: meeting_link || null,
      request_id
    };

    // Schedule the review
    await scheduleOptionalReview(reviewData, userType);

    return res.json({
      status: true,
      message: "Review scheduled successfully",
      data: reviewData
    });

  } catch (error) {
    console.error("Error scheduling review:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error"
    });
  }
};

module.exports = {
    scheduleReview
}