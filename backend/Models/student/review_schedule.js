const db = require('../../db.js');

// Get guide review schedules by team ID
const get_guide_reviews_by_team = (team_id) => {
    const query = `
        SELECT * FROM guide_review_schedules 
        WHERE team_id = ?
        ORDER BY date, time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

// Get sub-expert review schedules by team ID
const get_sub_expert_reviews_by_team = (team_id) => {
    const query = `
        SELECT * FROM sub_expert_review_schedules 
        WHERE team_id = ?
        ORDER BY date, time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

module.exports = {
    get_guide_reviews_by_team,
    get_sub_expert_reviews_by_team
};
