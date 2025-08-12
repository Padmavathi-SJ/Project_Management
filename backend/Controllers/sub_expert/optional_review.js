const {
    scheduleOptionalReview,
    getRequestDetailsById,
  getSubExpertStudents,
  updateSubExpertReviewStatus, 
  getSubExpertReviewById
} = require('../../Models/sub_expert/optional_review.js');


const getSubExpertStudentsForReview = async (req, res) => {
  try {
    const { user_reg_num } = req.params;

    const students = await getSubExpertStudents(user_reg_num);

    if (students.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No approved requests found for this sub-expert"
      });
    }

    return res.json({
      status: true,
      user_type: 'sub_expert',
      data: students
    });

  } catch (error) {
    console.error("Error fetching sub-expert students:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
};


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

    // Get the request details using the model
    const request = await getRequestDetailsById(request_id);
    
    if (!request) {
      return res.status(404).json({
        status: false,
        error: "Request not found or not approved"
      });
    }

    // Verify user is authorized
    if (request.guide_reg_num !== user_reg_num && request.sub_expert_reg_num !== user_reg_num) {
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
      team_id: request.team_id,
      project_id: request.project_id,
      semester: request.semester,
      review_type: request.review_type,
      venue: venue || 'To be determined',
      date,
      time,
      meeting_link: meeting_link || null,
      request_id
     //guide_reg_num: request.guide_reg_num
    };

    // Schedule the review using the model
    await scheduleOptionalReview(reviewData);

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


const updateSubExpertReviewStatusController = async (req, res) => {
  try {
    const { review_id, sub_expert_reg_num } = req.params;
    const { status } = req.body;

    if (!['Completed', 'Not completed', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid status value'
      });
    }

    await updateSubExpertReviewStatus(review_id, sub_expert_reg_num, status);
    const updatedReview = await getSubExpertReviewById(review_id, sub_expert_reg_num);

    res.json({
      status: true,
      message: 'Sub-expert review status updated successfully',
      data: updatedReview
    });

  } catch (error) {
    console.error('Error updating sub-expert review status:', error);
    const statusCode = error.message.includes('not found') ? 404 : 500;
    res.status(statusCode).json({
      status: false,
      error: error.message
    });
  }
};


module.exports = {
    getSubExpertStudentsForReview,
    scheduleReview,
    updateSubExpertReviewStatusController
}