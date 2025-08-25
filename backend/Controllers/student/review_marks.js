const { 
    get_average_marks, 
    get_review_status, 
    check_challenge_review_eligibility,
    check_optional_review_eligibility 
} = require('../../Models/student/review_marks.js');
const db = require('../../db.js');

// Helper function for promise-based db queries
const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

const fetch_average_marks = async (req, res) => {
    const { student_reg_num, team_id } = req.params;
    const { semester, review_type, review_mode = 'regular' } = req.query;

    if (!student_reg_num || !team_id || !semester || !review_type) {
        return res.status(400).json({
            status: false,
            error: "Missing required parameters"
        });
    }

    try {
        const marksResult = await get_average_marks(
            student_reg_num, 
            team_id, 
            semester, 
            review_type,
            review_mode
        );

        if (!marksResult) {
            return res.json({
                status: true,
                average_marks: null,
                marks_source: null,
                review_mode: null
            });
        }

        return res.json({
            status: true,
            average_marks: marksResult.average_marks,
            marks_source: `${review_mode}_review`,
            review_mode: review_mode
        });
        
    } catch (error) {
        console.error("Error fetching average marks:", error);
        return res.status(500).json({
            status: false,
            error: "Failed to calculate average marks",
            details: error.message
        });
    }
};

const get_student_review_progress = async (req, res) => {
    const { student_reg_num, team_id } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !team_id || !semester || !review_type) {
        return res.status(400).json({ 
            status: false, 
            error: "Missing required parameters (student_reg_num, team_id, semester, review_type)" 
        });
    }

    try {
        // Check all review types in order of priority: regular -> optional -> challenge
        const reviewTypes = ['regular', 'optional', 'challenge'];
        let finalStatus = 'Not Completed';
        let average_marks = null;
        let marks_source = null;
        let review_mode = 'none';
        let guideStatus = 'Not Completed';
        let subExpertStatus = 'Not Completed';

        for (const type of reviewTypes) {
            const reviewStatus = await get_review_status(
                team_id, 
                semester, 
                review_type,
                student_reg_num,
                type
            );

            if (reviewStatus.reviewStatus === 'Completed') {
                const marksResult = await get_average_marks(
                    student_reg_num, 
                    team_id, 
                    semester, 
                    review_type,
                    type
                );
                
                if (marksResult) {
                    finalStatus = 'Completed';
                    average_marks = marksResult.average_marks;
                    review_mode = type;
                    marks_source = `${type}_review`;
                    guideStatus = reviewStatus.guideStatus;
                    subExpertStatus = reviewStatus.subExpertStatus;
                    break; // Stop checking once we find a completed review
                }
            }
        }

        return res.json({
            status: true,
            data: {
                student_reg_num,
                team_id,
                semester,
                review_type,
                guide_status: guideStatus,
                sub_expert_status: subExpertStatus,
                overall_status: finalStatus,
                awarded_marks: average_marks,
                marks_source: marks_source,
                review_mode: review_mode
            }
        });
    } catch (error) {
        console.error("Error in student review progress:", error);
        return res.status(500).json({ 
            status: false, 
            error: "Internal Server Error",
            details: error.message 
        });
    }
};

// Controller for challenge review eligibility check
const check_challenge_review_eligibility_controller = async (req, res) => {
    const { student_reg_num } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !semester || !review_type) {
        return res.status(400).json({
            status: false,
            error: "Missing required parameters"
        });
    }

    try {
        const eligibility = await check_challenge_review_eligibility(
            student_reg_num,
            semester,
            review_type
        );

        return res.json({
            status: true,
            isEligible: eligibility.isEligible,
            reason: eligibility.reason
        });
    } catch (error) {
        console.error("Error checking challenge review eligibility:", error);
        return res.status(500).json({
            status: false,
            error: "Failed to check eligibility",
            details: error.message
        });
    }
};

// Controller for optional review eligibility check
const check_optional_review_eligibility_controller = async (req, res) => {
    const { student_reg_num } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !semester || !review_type) {
        return res.status(400).json({
            status: false,
            error: "Missing required parameters"
        });
    }

    try {
        const eligibility = await check_optional_review_eligibility(
            student_reg_num,
            semester,
            review_type
        );

        return res.json({
            status: true,
            isEligible: eligibility.isEligible,
            reason: eligibility.reason
        });
    } catch (error) {
        console.error("Error checking optional review eligibility:", error);
        return res.status(500).json({
            status: false,
            error: "Failed to check eligibility",
            details: error.message
        });
    }
};

module.exports = {
    fetch_average_marks,
    get_student_review_progress,
    check_challenge_review_eligibility_controller,
    check_optional_review_eligibility_controller
};