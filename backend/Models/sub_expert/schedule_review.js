const db = require('../../db.js');
const { v4: uuidv4 } = require('uuid');

const get_teams_by_sub_expert = (sub_expert_reg_num) => {
    const query = `
        SELECT 
            team_id, 
            GROUP_CONCAT(reg_num) AS members,
            project_id
        FROM teams 
        WHERE sub_expert_reg_num = ?
        GROUP BY team_id, project_id
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [sub_expert_reg_num], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const create_sub_expert_review_schedule = (reviewData) => {
    const query = `
        INSERT INTO sub_expert_review_schedules (
            review_id,
            sub_expert_reg_num,
            team_id,
            project_id,
            review_type,
            venue,
            date,
            time,
            meeting_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        reviewData.review_id,
        reviewData.sub_expert_reg_num,
        reviewData.team_id,
        reviewData.project_id,
        reviewData.review_type,
        reviewData.venue,
        reviewData.date,
        reviewData.time,
        reviewData.meeting_link
    ];
    
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const get_schedules_by_sub_expert = (sub_expert_reg_num) => {
    const query = `
        SELECT * FROM sub_expert_review_schedules 
        WHERE sub_expert_reg_num = ?
        ORDER BY date, time
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [sub_expert_reg_num], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

module.exports = {
    get_teams_by_sub_expert,
    create_sub_expert_review_schedule,
    get_schedules_by_sub_expert
};