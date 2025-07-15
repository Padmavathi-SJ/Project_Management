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

const updateReviewStatus = (reviewId, subExpertRegNum, newStatus) => {
    return new Promise((resolve, reject) => {
        const query = `
        update sub_expert_review_schedules
        set status = ?
        where review_id = ? and sub_expert_reg_num = ?
        `;
        db.query(query, [newStatus, reviewId, subExpertRegNum], (err, result) => {
            if(err) return reject(err);
            if(result.affectedRows === 0) {
                return reject(new Error('No review found with the given ID and sub-expert registration number'));
            }
            resolve(result);
        })
    })
}


const getReviewById = (reviewId, subExpertRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM sub_expert_review_schedules 
      WHERE review_id = ? AND sub_expert_reg_num = ?
    `;
    db.query(query, [reviewId, subExpertRegNum], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) {
        return reject(new Error('Review not found'));
      }
      resolve(result[0]);
    });
  });
};

module.exports = {
    get_teams_by_sub_expert,
    create_sub_expert_review_schedule,
    get_schedules_by_sub_expert,
    updateReviewStatus,
    getReviewById
};