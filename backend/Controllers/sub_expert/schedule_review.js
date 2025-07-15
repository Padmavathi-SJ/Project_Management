const { 
    get_teams_by_sub_expert, 
    create_sub_expert_review_schedule, 
    get_schedules_by_sub_expert,
    updateReviewStatus,
    getReviewById
} = require('../../Models/sub_expert/schedule_review.js');
const { v4: uuidv4 } = require('uuid');

const fetch_teams = async (req, res) => {
    const { sub_expert_reg_num } = req.params;
    try {
        const teams = await get_teams_by_sub_expert(sub_expert_reg_num);
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
    const { sub_expert_reg_num } = req.params;
    const {
        team_id,
        project_id,
        review_type,
        venue,
        date,
        time,
        meeting_link
    } = req.body;

    const review_id = `REV-${uuidv4().substring(0, 8)}`;
    
    const reviewData = {
        review_id,
        sub_expert_reg_num,
        team_id,
        project_id,
        review_type,
        venue,
        date,
        time,
        meeting_link
    };

    try {
        const result = await create_sub_expert_review_schedule(reviewData);
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
    const { sub_expert_reg_num } = req.params;
    try {
        const schedules = await get_schedules_by_sub_expert(sub_expert_reg_num);
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

const updateSubExpertReviewStatus = async (req, res) => {
    try {
        const {reviewId, sub_expert_reg_num} = req.params;
        const { status } = req.body;

        // Only validate that the status is one of the allowed values
    if (!['Completed', 'Not completed', 'Rescheduled'].includes(status)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid status value'
      });
    }

    await updateReviewStatus(reviewId, sub_expert_reg_num, status);

    const updatedReview = await getReviewById(reviewId, sub_expert_reg_num);

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
    }


module.exports = {
    fetch_teams,
    schedule_review,
    fetch_schedules,
    updateSubExpertReviewStatus
};