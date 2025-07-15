const { 
    get_teams_by_guide, 
    create_review_schedule, 
    get_schedules_by_guide,
    updateReviewStatus,
    getReviewById
} = require('../../Models/guide/schedule_review.js');
const { v4: uuidv4 } = require('uuid');

const fetch_teams = async (req, res) => {
    const { guide_reg_num } = req.params;
    try {
        const teams = await get_teams_by_guide(guide_reg_num);
        return res.json({ status: true, teams });
    } catch (error) {
        console.log("Error fetching teams: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};

const schedule_review = async (req, res) => {
    const { guide_reg_num } = req.params;
    const {
        team_id,
        project_id,
        semester,
        review_type,
        venue,
        date,
        time,
        meeting_link
    } = req.body;

     // Validate required fields
    const requiredFields = ['team_id', 'project_id', 'semester', 'review_type', 'venue', 'date', 'time'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
        return res.status(400).json({
            status: false,
            error: `Missing required fields: ${missingFields.join(', ')}`
        });
    }

    // Validate semester
    if (!['5', '6', '7', '8'].includes(semester)) {
        return res.status(400).json({
            status: false,
            error: 'Invalid semester value. Must be 5, 6, 7, or 8'
        });
    }

    // Validate review type
    if (!['review-1', 'review-2'].includes(review_type)) {
        return res.status(400).json({
            status: false,
            error: 'Invalid review type. Must be review-1 or review-2'
        });
    }

    const review_id = `REV-${uuidv4().substring(0, 8)}`;
    
    const reviewData = {
        review_id,
        guide_reg_num,
        team_id,
        project_id,
        semester,
        review_type,
        venue,
        date,
        time,
        meeting_link
    };

    try {
        const result = await create_review_schedule(reviewData);
        return res.json({ 
            status: true, 
            message: "Review scheduled successfully",
            review: reviewData
        });
    } catch (error) {
        console.log("Error scheduling review: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Failed to schedule review" 
        });
    }
};

const fetch_schedules = async (req, res) => {
    const { guide_reg_num } = req.params;
    try {
        const schedules = await get_schedules_by_guide(guide_reg_num);
        return res.json({ 
            status: true, 
            schedules 
        });
    } catch (error) {
        console.log("Error fetching schedules: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};


const updateGuideReviewStatus = async (req, res) => {
  try {
    const { reviewId, guide_reg_num } = req.params;
    const { status } = req.body;
    
    // Only validate that the status is one of the allowed values
    if (!['Completed', 'Not completed', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid status value'
      });
    }

    await updateReviewStatus(reviewId, guide_reg_num, status);
    
    const updatedReview = await getReviewById(reviewId, guide_reg_num);
    
    res.json({
      status: true,
      message: 'Review status updated successfully',
      review: updatedReview
    });
  } catch (error) {
    console.error('Error updating review status:', error);
    res.status(500).json({
      status: false,
      error: error.message || 'Failed to update review status'
    });
  }
};


module.exports = {
    fetch_teams,
    schedule_review,
    fetch_schedules,
    updateGuideReviewStatus
};