const { get_average_marks, get_review_status } = require('../../Models/student/review_marks.js');
const db = require('../../db.js'); // Make sure to import your db connection

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

        // Determine marks source
        const semesterPrefix = semester === '5' || semester === '6' ? 's5_s6' : `s${semester}`;
        const reviewType = review_type === 'review-1' ? 'first' : 'second';
        const regularGuideTable = `${semesterPrefix}_${reviewType}_review_marks_byguide`;
        
        const regularResults = await dbQuery(
            `SELECT total_marks FROM ${regularGuideTable} 
             WHERE student_reg_num = ? AND team_id = ? 
             AND semester = ? AND review_type = ? 
             AND attendance = 'present' AND total_marks IS NOT NULL`,
            [student_reg_num, team_id, semester, review_type]
        );
        
        const marks_source = regularResults.length > 0 ? 'regular_review' : 'optional_review';

        return res.json({
            status: true,
            average_marks: averageMarks,
            marks_source: marks_source
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
        const { reviewStatus, guideStatus, subExpertStatus } = await get_review_status(
            team_id, 
            semester, 
            review_type,
            student_reg_num
        );

        let average_marks = null;
        let marks_source = null;
        
        if (reviewStatus === 'Completed') {
            average_marks = await get_average_marks(student_reg_num, team_id, semester, review_type);
            
            const semesterPrefix = semester === '5' || semester === '6' ? 's5_s6' : `s${semester}`;
            const reviewType = review_type === 'review-1' ? 'first' : 'second';
            const regularGuideTable = `${semesterPrefix}_${reviewType}_review_marks_byguide`;
            
            const regularResults = await dbQuery(
                `SELECT total_marks FROM ${regularGuideTable} 
                 WHERE student_reg_num = ? AND team_id = ? 
                 AND semester = ? AND review_type = ? 
                 AND attendance = 'present' AND total_marks IS NOT NULL`,
                [student_reg_num, team_id, semester, review_type]
            );
            
            marks_source = regularResults.length > 0 ? 'regular_review' : 'optional_review';
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
                overall_status: reviewStatus,
                awarded_marks: average_marks,
                marks_source: marks_source
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

module.exports = {
    fetch_average_marks,
    get_student_review_progress: get_student_review_progress // Fixed typo in export
};