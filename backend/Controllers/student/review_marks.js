const { get_average_marks, get_review_status } = require('../../Models/student/review_marks.js');

const fetch_average_marks = async (req, res) => {
    const { student_reg_num, team_id } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !team_id || !semester || !review_type) {
        return res.status(400).json({
            status: false,
            error: "Missing required parameters"
        });
    }

    try {
        const averageMarks = await get_average_marks(
            student_reg_num, 
            team_id, 
            semester, 
            review_type
        );

        return res.json({
            status: true,
            average_marks: averageMarks
        });
        
    } catch (error) {
        console.error("Error fetching average marks:", error);
        return res.status(500).json({
            status: false,
            error: "Failed to calculate average marks"
        });
    }
};


const get_student_review_progress = async (req, res) => {
    const { student_reg_num, team_id } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !team_id || !semester || !review_type) {
        return res.status(400).json({ status: false, error: "Missing required parameters" });
    }

    try {
        const { reviewStatus, guideStatus, subExpertStatus } = await get_review_status(team_id, semester, review_type);

        let average_marks = null;
        if (reviewStatus === 'Completed') {
            average_marks = await get_average_marks(student_reg_num, team_id, semester, review_type);
        }

        return res.json({
            status: true,
            data: {
                student_reg_num,
                team_id,
                semester,
                review_type,
                status: reviewStatus,
                awarded_marks: average_marks
            }
        });

    } catch (error) {
        console.error("Error in student review progress:", error);
        return res.status(500).json({ status: false, error: "Internal Server Error" });
    }
};


module.exports = {
    fetch_average_marks,
    get_student_review_progress
};