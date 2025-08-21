const db = require('../../db.js');

// Check if user is PMC1 for a specific assignment
const isUserPMC1 = (staffRegNum, studentRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 1 FROM challenge_review_reviewers_assignment
      WHERE student_reg_num = ? AND pmc1_reg_num = ?
      LIMIT 1
    `;
    db.query(query, [studentRegNum, staffRegNum], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

// Get all challenge review assignments for a staff member
const getChallengeReviewAssignments = (staffRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT a.*, 
             u.name as student_name,
             p.project_name,
             t.team_id,
             a.pmc1_reg_num = ? as is_pmc1
      FROM challenge_review_reviewers_assignment a
      LEFT JOIN users u ON a.student_reg_num = u.reg_num
      LEFT JOIN projects p ON a.project_id = p.project_id
      LEFT JOIN teams t ON a.team_id = t.team_id
      WHERE a.pmc1_reg_num = ? OR a.pmc2_reg_num = ?
      GROUP BY a.assignment_id
    `;
    db.query(query, [staffRegNum, staffRegNum, staffRegNum], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Schedule a new challenge review
const scheduleChallengeReview = (reviewData) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO challenge_review_schedules 
      (review_id, student_reg_num, pmc1_reg_num, pmc2_reg_num, team_id, project_id, 
       semester, review_type, review_mode, venue, Date, start_time, end_time, meeting_link)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      reviewData.review_id,
      reviewData.student_reg_num,
      reviewData.pmc1_reg_num,
      reviewData.pmc2_reg_num,
      reviewData.team_id,
      reviewData.project_id,
      reviewData.semester,
      reviewData.review_type,
      reviewData.review_mode,
      reviewData.venue,
      reviewData.Date,
      reviewData.start_time,
      reviewData.end_time,
      reviewData.meeting_link
    ];
    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

// Get scheduled challenge reviews for a staff member with role info
const getScheduledChallengeReviews = (staffRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT s.*,
             u.name,
             p.project_name,
             t.team_id,
             s.pmc1_reg_num = ? as is_pmc1
      FROM challenge_review_schedules s
      LEFT JOIN users u ON s.student_reg_num = u.reg_num
      LEFT JOIN projects p ON s.project_id = p.project_id
      LEFT JOIN teams t ON s.team_id = t.team_id
      WHERE s.pmc1_reg_num = ? OR s.pmc2_reg_num = ?
      GROUP BY s.review_id
    `;
    db.query(query, [staffRegNum, staffRegNum, staffRegNum], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};



// Update review status
const updateReviewStatus = (reviewId, staffType, newStatus) => {
  return new Promise((resolve, reject) => {
    const statusField = staffType === 'pmc1' ? 'pmc1_review_status' : 'pmc2_review_status';
    const query = `
      UPDATE challenge_review_schedules
      SET ${statusField} = ?
      WHERE review_id = ?
    `;
    db.query(query, [newStatus, reviewId], (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error('Review not found'));
      }
      resolve(result);
    });
  });
};

// ...existing code...

const getReviewerRole = (reg_num, review_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        pmc1_reg_num = ? as is_pmc1,
        pmc2_reg_num = ? as is_pmc2
      FROM challenge_review_schedules
      WHERE review_id = ?
    `;
    db.query(query, [reg_num, reg_num, review_id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0] || null);
    });
  });
};



module.exports = {
  isUserPMC1,
  getChallengeReviewAssignments,
  getScheduledChallengeReviews,
  scheduleChallengeReview,
  updateReviewStatus,
  getReviewerRole
};