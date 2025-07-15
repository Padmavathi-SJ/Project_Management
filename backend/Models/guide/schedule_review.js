const db = require('../../db.js');
const { v4: uuidv4 } = require('uuid');

const get_teams_by_guide = (guide_reg_num) => {
    const query = `
        SELECT 
            team_id, 
            GROUP_CONCAT(reg_num) AS members,
            project_id
        FROM teams 
        WHERE guide_reg_num = ?
        GROUP BY team_id, project_id
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [guide_reg_num], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const create_review_schedule = (reviewData) => {
  //validate semester
  if (!['5', '6', '7', '8'].includes(reviewData.semester)) {
    throw new Error('Invalid semester value');
  }

  //validate review type
  if(!['review-1', 'review-2'].includes(reviewData.review_type)) {
    throw new Error('Invalid ewview type');
  }
    const query = `
        INSERT INTO guide_review_schedules (
            review_id,
            guide_reg_num,
            team_id,
            project_id,
            semester,
            review_type,
            venue,
            date,
            time,
            meeting_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        reviewData.review_id,
        reviewData.guide_reg_num,
        reviewData.team_id,
        reviewData.project_id,
        reviewData.semester,
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

const get_schedules_by_guide = (guide_reg_num) => {
    const query = `
        SELECT * FROM guide_review_schedules 
        WHERE guide_reg_num = ?
        ORDER BY date, time
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [guide_reg_num], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};



const updateReviewStatus = (reviewId, guideRegNum, newStatus) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE guide_review_schedules 
      SET status = ? 
      WHERE review_id = ? AND guide_reg_num = ?
    `;
    db.query(query, [newStatus, reviewId, guideRegNum], (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error('No review found with the given ID and guide registration number'));
      }
      resolve(result);
    });
  });
};

const getReviewById = (reviewId, guideRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM guide_review_schedules 
      WHERE review_id = ? AND guide_reg_num = ?
    `;
    db.query(query, [reviewId, guideRegNum], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) {
        return reject(new Error('Review not found'));
      }
      resolve(result[0]);
    });
  });
};



module.exports = {
    get_teams_by_guide,
    create_review_schedule,
    get_schedules_by_guide,
    updateReviewStatus,
  getReviewById
};