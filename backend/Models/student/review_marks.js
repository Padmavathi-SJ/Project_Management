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

// Helper function to determine table name for regular reviews
const getRegularTableName = (semester, review_type, evaluator_type) => {
    const prefix = semester === '7' ? 's7' : 's5_s6';
    const review = review_type === 'review-1' ? 'first_review' : 'second_review';
    const evaluator = evaluator_type === 'guide' ? 'byguide' : 'bysubexpert';
    return `${prefix}_${review}_marks_${evaluator}`;
};

// Helper function to determine table name for optional reviews
const getOptionalTableName = (semester, review_type, evaluator_type) => {
    const prefix = semester === '7' ? 's7' : 's5_s6';
    const review = review_type === 'review-1' ? 'first' : 'second';
    const evaluator = evaluator_type === 'guide' ? 'byguide' : 'bysubexpert';
    return `${prefix}_optional_${review}_review_marks_${evaluator}`;
};

// Helper function to determine table name for challenge reviews
const getChallengeTableName = (semester, review_type, evaluator_type) => {
    const prefix = semester === '7' ? 's7' : 's5_s6';
    const review = review_type === 'review-1' ? 'first_review' : 'second_review';
    const evaluator = evaluator_type === 'guide' ? 'bypmc1' : 'bypmc2';
    return `${prefix}_challenge_${review}_marks_${evaluator}`;
};

const get_review_status = async (team_id, semester, review_type, student_reg_num, review_mode = 'regular') => {
    try {
        let guideQuery, subExpertQuery;
        const params = [team_id, semester, review_type, student_reg_num];
        
        if (review_mode === 'challenge') {
            guideQuery = `
                SELECT attendance FROM ${getChallengeTableName(semester, review_type, 'guide')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
            
            subExpertQuery = `
                SELECT attendance FROM ${getChallengeTableName(semester, review_type, 'sub_expert')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
        } else if (review_mode === 'optional') {
            guideQuery = `
                SELECT attendance FROM ${getOptionalTableName(semester, review_type, 'guide')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
            
            subExpertQuery = `
                SELECT attendance FROM ${getOptionalTableName(semester, review_type, 'sub_expert')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
        } else {
            guideQuery = `
                SELECT attendance FROM ${getRegularTableName(semester, review_type, 'guide')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
            
            subExpertQuery = `
                SELECT attendance FROM ${getRegularTableName(semester, review_type, 'sub_expert')}
                WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
                LIMIT 1
            `;
        }

        const [guideResult, subExpertResult] = await Promise.all([
            dbQuery(guideQuery, params),
            dbQuery(subExpertQuery, params)
        ]);

        const guidePresent = guideResult.length > 0 && guideResult[0].attendance === 'present';
        const subExpertPresent = subExpertResult.length > 0 && subExpertResult[0].attendance === 'present';

        return {
            guideStatus: guidePresent ? 'Completed' : 'Not Completed',
            subExpertStatus: subExpertPresent ? 'Completed' : 'Not Completed',
            reviewStatus: (guidePresent && subExpertPresent) ? 'Completed' : 'Not Completed',
            reviewMode: (guidePresent && subExpertPresent) ? review_mode : 'none'
        };
    } catch (error) {
        console.error("Error checking review status:", error);
        throw error;
    }
};


const get_average_marks = async (student_reg_num, team_id, semester, review_type, review_mode = 'regular') => {
    try {
        let guideTable, subExpertTable;
        
        if (review_mode === 'challenge') {
            guideTable = getChallengeTableName(semester, review_type, 'guide');
            subExpertTable = getChallengeTableName(semester, review_type, 'sub_expert');
        } else if (review_mode === 'optional') {
            guideTable = getOptionalTableName(semester, review_type, 'guide');
            subExpertTable = getOptionalTableName(semester, review_type, 'sub_expert');
        } else {
            guideTable = getRegularTableName(semester, review_type, 'guide');
            subExpertTable = getRegularTableName(semester, review_type, 'sub_expert');
        }

        // Query marks from the specified review mode
        const [guideResults, subExpertResults] = await Promise.all([
            dbQuery(`SELECT total_marks, attendance FROM ${guideTable} 
                    WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ?`, 
                   [student_reg_num, team_id, semester, review_type]),
            dbQuery(`SELECT total_marks, attendance FROM ${subExpertTable} 
                    WHERE student_reg_num = ? AND team_id = ? AND semester = ? AND review_type = ?`, 
                   [student_reg_num, team_id, semester, review_type])
        ]);

        const guideMarks = guideResults.length > 0 && guideResults[0].attendance === 'present' ? guideResults[0].total_marks : null;
        const subExpertMarks = subExpertResults.length > 0 && subExpertResults[0].attendance === 'present' ? subExpertResults[0].total_marks : null;

        if (guideMarks !== null && subExpertMarks !== null) {
            return {
                average_marks: (guideMarks + subExpertMarks) / 2,
                review_mode: review_mode
            };
        }

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



// Improved eligibility checks
const check_challenge_review_eligibility = async (student_reg_num, semester, review_type, team_id) => {
    try {
        // Check if student has already completed any type of review
        const reviewTypes = ['regular', 'optional', 'challenge'];
        
        for (const type of reviewTypes) {
            const status = await get_review_status(
                team_id,
                semester, 
                review_type,
                student_reg_num,
                type
            );
            
            if (status.reviewStatus === 'Completed') {
                return {
                    isEligible: false,
                    reason: `Already completed ${type} review`
                };
            }
        }
        
        return {
            isEligible: true,
            reason: 'Eligible for challenge review'
        };
    } catch (error) {
        console.error("Error checking challenge review eligibility:", error);
        throw error;
    }
};

const check_optional_review_eligibility = async (student_reg_num, semester, review_type, team_id) => {
    try {
        // Check if student has already completed regular or optional review
        const reviewTypes = ['regular', 'optional'];
        
        for (const type of reviewTypes) {
            const status = await get_review_status(
                team_id,
                semester, 
                review_type,
                student_reg_num,
                type
            );
            
            if (status.reviewStatus === 'Completed') {
                return {
                    isEligible: false,
                    reason: `Already completed ${type} review`
                };
            }
        }
        
        return {
            isEligible: true,
            reason: 'Eligible for optional review'
        };
    } catch (error) {
        console.error("Error checking optional review eligibility:", error);
        throw error;
    }
};

module.exports = {
    get_student_review_progress,
    get_average_marks,
    get_review_status,
    check_challenge_review_eligibility,
    check_optional_review_eligibility
};