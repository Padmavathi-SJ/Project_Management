const db = require('../../db.js');


// Helper function to determine table name
const getTableName = (semester, review_type, evaluator_type) => {
    const prefix = semester === '7' ? 's7' : 's5_s6';
    const review = review_type === 'review-1' ? 'first_review' : 'second_review';
    const evaluator = evaluator_type === 'guide' ? 'byguide' : 'bysubexpert';
    return `${prefix}_${review}_marks_${evaluator}`;
};

// Helper function for promise-based db queries
const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};


const get_review_status = async (team_id, semester, review_type, student_reg_num) => {
    try {
        // Check guide's attendance status
        const guideQuery = `
            SELECT attendance FROM ${getTableName(semester, review_type, 'guide')}
            WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
            LIMIT 1
        `;
        
        // Check sub-expert's attendance status
        const subExpertQuery = `
            SELECT attendance FROM ${getTableName(semester, review_type, 'sub_expert')}
            WHERE team_id = ? AND semester = ? AND review_type = ? AND student_reg_num = ?
            LIMIT 1
        `;

        const [guideResult, subExpertResult] = await Promise.all([
            dbQuery(guideQuery, [team_id, semester, review_type, student_reg_num]),
            dbQuery(subExpertQuery, [team_id, semester, review_type, student_reg_num])
        ]);

        const guidePresent = guideResult.length > 0 && guideResult[0].attendance === 'present';
        const subExpertPresent = subExpertResult.length > 0 && subExpertResult[0].attendance === 'present';

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
        // Determine the correct tables based on semester and review type
        let guideTable, subExpertTable;
        
        if (semester === '5' || semester === '6') {
            guideTable = review_type === 'review-1' 
                ? 's5_s6_first_review_marks_byguide' 
                : 's5_s6_second_review_marks_byguide';
            
            subExpertTable = review_type === 'review-1'
                ? 's5_s6_first_review_marks_bysubexpert'
                : 's5_s6_second_review_marks_bysubexpert';
        } else if (semester === '7' || semester === '8') {
            guideTable = review_type === 'review-1' 
                ? 's7_first_review_marks_byguide' 
                : 's7_second_review_marks_byguide';
            
            subExpertTable = review_type === 'review-1'
                ? 's7_first_review_marks_bysubexpert'
                : 's7_second_review_marks_bysubexpert';
        } else {
            throw new Error('Invalid semester provided');
        }

        // Query to get guide marks
        const guideQuery = `
            SELECT total_marks 
            FROM ${guideTable}
            WHERE student_reg_num = ? 
            AND team_id = ?
            AND semester = ?
            AND review_type = ?
        `;
        
        // Query to get sub-expert marks
        const subExpertQuery = `
            SELECT total_marks 
            FROM ${subExpertTable}
            WHERE student_reg_num = ? 
            AND team_id = ?
            AND semester = ?
            AND review_type = ?
        `;

        // Execute both queries in parallel
        const [guideResults, subExpertResults] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(guideQuery, [student_reg_num, team_id, semester, review_type], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(subExpertQuery, [student_reg_num, team_id, semester, review_type], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            })
        ]);

        console.log(`Guide marks from ${guideTable}:`, guideResults);
        console.log(`Sub-expert marks from ${subExpertTable}:`, subExpertResults);

        // Calculate average if both marks exist
        if (guideResults.length > 0 && subExpertResults.length > 0) {
            const guideMarks = guideResults[0].total_marks;
            const subExpertMarks = subExpertResults[0].total_marks;
            const average = (guideMarks + subExpertMarks) / 2;
            console.log(`Calculated average: ${average}`);
            return average;
        }

        // Return null if marks aren't available from both evaluators
        console.log('No marks found from one or both evaluators');
        return null;
        
    } catch (error) {
        console.error("Error calculating average marks:", error);
        throw error;
    }
};


module.exports = {
    get_average_marks,
    
    get_review_status
};