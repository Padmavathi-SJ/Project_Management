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

const create_review_schedule = async (reviewData) => {
  //Get team details
  const teamQuery = `select guide_reg_num, sub_expert_reg_num from teams where team_id = ? limit 1`;

  const [team] = await db.promise().query(teamQuery, [reviewData.team_id]);
  
  if(!team || team.length === 0){
    throw new Error('Team not found');
  }

    const query = `
        INSERT INTO regular_review_schedules (
            guide_reg_num,
            sub_expert_reg_num,
            team_id,
            project_id,
            semester,
            review_type,
            review_mode,
            venue,
            date,
            start_time,
            end_time,
            meeting_link
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
        team[0].guide_reg_num,
        team[0].sub_expert_reg_num,
        reviewData.team_id,
        reviewData.project_id,
        reviewData.semester,
        reviewData.review_type,
        reviewData.review_mode || 'offline',
        reviewData.venue,
        reviewData.date,
        reviewData.start_time,
        reviewData.end_time,
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
        SELECT * FROM regular_review_schedules 
        WHERE guide_reg_num = ?
        ORDER BY date, start_time
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
      UPDATE regular_review_schedules 
      SET guide_review_status = ? 
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
      SELECT * FROM regular_review_schedules 
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