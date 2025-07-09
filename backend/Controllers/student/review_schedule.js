const { 
    get_guide_reviews_by_team, 
    get_sub_expert_reviews_by_team 
} = require('../../Models/student/review_schedule.js');

// Fetch reviews scheduled by guide for a given team
const fetch_guide_reviews_by_team = async (req, res) => {
    const { team_id } = req.params;

    if (!team_id) {
        return res.status(400).json({
            status: false,
            error: "Team ID is required"
        });
    }

    try {
        const reviews = await get_guide_reviews_by_team(team_id);
        return res.json({ 
            status: true, 
            reviews 
        });
    } catch (error) {
        console.log("Error fetching guide reviews: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};

// Fetch reviews scheduled by sub-expert for a given team
const fetch_sub_expert_reviews_by_team = async (req, res) => {
    const { team_id } = req.params;

    if (!team_id) {
        return res.status(400).json({
            status: false,
            error: "Team ID is required"
        });
    }

    try {
        const reviews = await get_sub_expert_reviews_by_team(team_id);
        return res.json({ 
            status: true, 
            reviews 
        });
    } catch (error) {
        console.log("Error fetching sub-expert reviews: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};

module.exports = {
    fetch_guide_reviews_by_team,
    fetch_sub_expert_reviews_by_team
};
