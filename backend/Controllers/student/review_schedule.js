const { 
    get_regular_reviews_by_team,
    get_regular_reviews_with_details,
    get_upcoming_regular_reviews,
    get_upcoming_regular_reviews_with_details
} = require('../../Models/student/review_schedule.js');

// Fetch regular review schedules for a given team
const fetch_regular_reviews_by_team = async (req, res) => {
    const { team_id } = req.params;
    const { details = 'false' } = req.query; // Optional parameter to include user details

    if (!team_id) {
        return res.status(400).json({
            status: false,
            error: "Team ID is required"
        });
    }

    try {
        let reviews;
        
        if (details.toLowerCase() === 'true') {
            reviews = await get_regular_reviews_with_details(team_id);
        } else {
            reviews = await get_regular_reviews_by_team(team_id);
        }

        return res.json({ 
            status: true, 
            message: "Regular review schedules fetched successfully",
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        console.log("Error fetching regular reviews: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};

// Fetch upcoming regular reviews for a team
const fetch_upcoming_regular_reviews = async (req, res) => {
    const { team_id } = req.params;
    const { details = 'false' } = req.query; // Optional parameter to include user details

    if (!team_id) {
        return res.status(400).json({
            status: false,
            error: "Team ID is required"
        });
    }

    try {
        let reviews;
        
        if (details.toLowerCase() === 'true') {
            reviews = await get_upcoming_regular_reviews_with_details(team_id);
        } else {
            reviews = await get_upcoming_regular_reviews(team_id);
        }

        return res.json({ 
            status: true, 
            message: "Upcoming reviews fetched successfully",
            data: reviews,
            count: reviews.length
        });
    } catch (error) {
        console.log("Error fetching upcoming reviews: ", error);
        return res.status(500).json({ 
            status: false, 
            error: "Database Query Error" 
        });
    }
};

module.exports = {
    fetch_regular_reviews_by_team,
    fetch_upcoming_regular_reviews
};