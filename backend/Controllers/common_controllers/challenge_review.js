const challengeReviewModel = require('../../Models/common_models/challenge_review.js');
const { checkSeniorStaff } = require('../../middlewares/challange_review.js');

// Get all assignments for staff
exports.getAssignments = async (req, res) => {
  try {
    const { reg_num } = req.params; // Assuming user is authenticated
    const assignments = await challengeReviewModel.getChallengeReviewAssignments(reg_num);
    
    res.json({
      status: true,
      data: assignments
    });
  } catch (error) {
    console.error('Error fetching assignments:', error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};

// Get scheduled reviews for staff
exports.getScheduledReviews = async (req, res) => {
  try {
    const { reg_num } = req.params;
    const reviews = await challengeReviewModel.getScheduledChallengeReviews(reg_num);
    
    res.json({
      status: true,
      data: reviews
    });
  } catch (error) {
    console.error('Error fetching scheduled reviews:', error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};

// Schedule a new review (only for senior staff/pmc1)
exports.scheduleReview = async (req, res) => {
  try {
    const { reg_num } = req.params;
    
    // Verify the requesting user is the pmc1/senior for this assignment
    const isSenior = await checkSeniorStaff(reg_num, req.body.student_reg_num);
    if (!isSenior) {
      return res.status(403).json({
        status: false,
        error: 'Only senior reviewer (PMC1) can schedule reviews'
      });
    }
    
    const reviewData = {
      ...req.body,
      pmc1_reg_num: reg_num // Ensure the schedule is created with the senior as pmc1
    };
    
    const result = await challengeReviewModel.scheduleChallengeReview(reviewData);
    
    res.status(201).json({
      status: true,
      message: 'Challenge review scheduled successfully',
      data: {
        review_id: result.insertId
      }
    });
  } catch (error) {
    console.error('Error scheduling review:', error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};

// Update review status
exports.updateReviewStatus = async (req, res) => {
  try {
    const { reg_num, review_id } = req.parms;
    const { status, staff_type } = req.body;
    
    // Validate status
    if (!['Completed', 'Not completed', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid status value'
      });
    }
    
    // Validate staff type
    if (!['pmc1', 'pmc2'].includes(staff_type)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid staff type'
      });
    }
    
    await challengeReviewModel.updateReviewStatus(review_id, staff_type, status);
    
    res.json({
      status: true,
      message: 'Review status updated successfully'
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      status: false,
      error: error.message
    });
  }
};