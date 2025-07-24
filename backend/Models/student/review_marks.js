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

// Helper function to determine table name
const getTableName = (semester, review_type, evaluator_type) => {
    const prefix = semester === '7' ? 's7' : 's5_s6';
    const review = review_type === 'review-1' ? 'first_review' : 'second_review';
    const evaluator = evaluator_type === 'guide' ? 'byguide' : 'bysubexpert';
    return `${prefix}_${review}_marks_${evaluator}`;
};

const get_review_status = async (team_id, semester, review_type, student_reg_num) => {
    try {
        // Check guide's attendance status in regular review
        const guideQuery = `
            SELECT attendance FROM ${getTableName(semester, review_type, 'guide')}
            WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
            LIMIT 1
        `;
        
        // Check sub-expert's attendance status in regular review
        const subExpertQuery = `
            SELECT attendance FROM ${getTableName(semester, review_type, 'sub_expert')}
            WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
            LIMIT 1
        `;

        const [guideResult, subExpertResult] = await Promise.all([
            dbQuery(guideQuery, [team_id, semester, review_type, student_reg_num]),
            dbQuery(subExpertQuery, [team_id, semester, review_type, student_reg_num])
        ]);

        // Check optional review tables if absent in regular review
        let guidePresent = guideResult.length > 0 && guideResult[0].attendance === 'present';
        let subExpertPresent = subExpertResult.length > 0 && subExpertResult[0].attendance === 'present';

        // If absent in regular review, check optional review
        if (!guidePresent || !subExpertPresent) {
            const semesterPrefix = semester === '5' || semester === '6' ? 's5_s6' : `s${semester}`;
            const reviewType = review_type === 'review-1' ? 'first' : 'second';
            
            const optionalGuideTable = `${semesterPrefix}_optional_${reviewType}_review_marks_byguide`;
            const optionalSubExpertTable = `${semesterPrefix}_optional_${reviewType}_review_marks_bysubexpert`;

            const [optionalGuideResult, optionalSubExpertResult] = await Promise.all([
                dbQuery(`SELECT attendance FROM ${optionalGuideTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ? LIMIT 1`, 
                       [student_reg_num, team_id, semester, review_type]),
                dbQuery(`SELECT attendance FROM ${optionalSubExpertTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ? LIMIT 1`, 
                       [student_reg_num, team_id, semester, review_type])
            ]);

            if (!guidePresent) {
                guidePresent = optionalGuideResult.length > 0 && optionalGuideResult[0].attendance === 'present';
            }
            if (!subExpertPresent) {
                subExpertPresent = optionalSubExpertResult.length > 0 && optionalSubExpertResult[0].attendance === 'present';
            }
        }

        return {
            guideStatus: guidePresent ? 'Completed' : 'Not Completed',
            subExpertStatus: subExpertPresent ? 'Completed' : 'Not Completed',
            reviewStatus: (guidePresent && subExpertPresent) ? 'Completed' : 'Not Completed'
        };
    } catch (error) {
        console.error("Error checking review status:", error);
        throw error;
    }
};

const get_average_marks = async (student_reg_num, team_id, semester, review_type) => {
    try {
        const semesterPrefix = semester === '5' || semester === '6' ? 's5_s6' : `s${semester}`;
        const reviewType = review_type === 'review-1' ? 'first' : 'second';
        
        // First check regular review tables
        const regularGuideTable = `${semesterPrefix}_${reviewType}_review_marks_byguide`;
        const regularSubExpertTable = `${semesterPrefix}_${reviewType}_review_marks_bysubexpert`;

        // Query regular review marks first
        const [regularGuideResults, regularSubExpertResults] = await Promise.all([
            dbQuery(`SELECT total_marks, attendance FROM ${regularGuideTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ?`, 
                   [student_reg_num, team_id, semester, review_type]),
            dbQuery(`SELECT total_marks, attendance FROM ${regularSubExpertTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ?`, 
                   [student_reg_num, team_id, semester, review_type])
        ]);

        // Check if we have complete marks from regular review
        const regularGuideMarks = regularGuideResults.length > 0 && regularGuideResults[0].attendance === 'present' ? regularGuideResults[0].total_marks : null;
        const regularSubExpertMarks = regularSubExpertResults.length > 0 && regularSubExpertResults[0].attendance === 'present' ? regularSubExpertResults[0].total_marks : null;

        if (regularGuideMarks !== null && regularSubExpertMarks !== null) {
            return (regularGuideMarks + regularSubExpertMarks) / 2;
        }

        // If missing marks in regular review, check optional review tables
        const optionalGuideTable = `${semesterPrefix}_optional_${reviewType}_review_marks_byguide`;
        const optionalSubExpertTable = `${semesterPrefix}_optional_${reviewType}_review_marks_bysubexpert`;

        const [optionalGuideResults, optionalSubExpertResults] = await Promise.all([
            dbQuery(`SELECT total_marks FROM ${optionalGuideTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ? AND attendance = 'present'`, 
                   [student_reg_num, team_id, semester, review_type]),
            dbQuery(`SELECT total_marks FROM ${optionalSubExpertTable} WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ? AND attendance = 'present'`, 
                   [student_reg_num, team_id, semester, review_type])
        ]);

        const optionalGuideMarks = optionalGuideResults.length > 0 ? optionalGuideResults[0].total_marks : null;
        const optionalSubExpertMarks = optionalSubExpertResults.length > 0 ? optionalSubExpertResults[0].total_marks : null;

        if (optionalGuideMarks !== null && optionalSubExpertMarks !== null) {
            return (optionalGuideMarks + optionalSubExpertMarks) / 2;
        }

        console.log('No complete marks found from both evaluators');
        return null;
    } catch (error) {
        console.error("Error calculating average marks:", error);
        throw error;
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
    get_student_review_progress,
    get_average_marks,
    get_review_status
};