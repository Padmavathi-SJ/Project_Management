const db = require('../../db.js');

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


// Check if both guide and sub-expert scheduled and completed the review
const get_review_status = (team_id, semester, review_type) => {
    return new Promise((resolve, reject) => {
        const guideQuery = `
            SELECT status FROM guide_review_schedules 
            WHERE team_id = ? AND semester = ? AND review_type = ?
        `;

        const subExpertQuery = `
            SELECT status FROM sub_expert_review_schedules 
            WHERE team_id = ? AND semester = ? AND review_type = ?
        `;

        Promise.all([
            new Promise((res, rej) => {
                db.query(guideQuery, [team_id, semester, review_type], (err, result) => {
                    if (err) return rej(err);
                    res(result.length > 0 ? result[0].status : null);
                });
            }),
            new Promise((res, rej) => {
                db.query(subExpertQuery, [team_id, semester, review_type], (err, result) => {
                    if (err) return rej(err);
                    res(result.length > 0 ? result[0].status : null);
                });
            })
        ])
        .then(([guideStatus, subExpertStatus]) => {
            const completed = guideStatus === 'Completed' && subExpertStatus === 'Completed';
            resolve({ guideStatus, subExpertStatus, reviewStatus: completed ? 'Completed' : 'Pending' });
        })
        .catch(err => reject(err));
    });
};




module.exports = {
    get_average_marks,
    
    get_review_status
};