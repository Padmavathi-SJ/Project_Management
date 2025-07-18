const db = require('../../db.js');

const getRequestDetailsById = (request_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM optional_review_requests 
      WHERE request_id = ? AND request_status = 'approved'
    `;
    
    db.query(query, [request_id], (err, results) => {
      if (err) return reject(err);
      resolve(results[0]); // Return the first (and should be only) matching request
    });
  });
};

const scheduleOptionalReview = (reviewData, userType) => {
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!reviewData.review_id || !reviewData.student_reg_num || !reviewData.team_id || 
        !reviewData.project_id || !reviewData.semester || !reviewData.date || !reviewData.time) {
      return reject(new Error('Missing required fields for scheduling review'));
    }

    // Determine which table to use based on user type
    const table = userType === 'guide' 
      ? 'optional_review_schedules_byguide' 
      : 'optional_review_schedules_bysubexpert';

    const regNumField = userType === 'guide' ? 'guide_reg_num' : 'sub_expert_reg_num';
    const regNumValue = userType === 'guide' ? reviewData.guide_reg_num : reviewData.sub_expert_reg_num;

    const query = `
      INSERT INTO ${table} (
        review_id, 
        student_reg_num, 
        ${regNumField}, 
        team_id, 
        project_id,
        semester, 
        review_type, 
        venue, 
        date, 
        time, 
        meeting_link, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      reviewData.review_id,
      reviewData.student_reg_num,
      regNumValue,
      reviewData.team_id,
      reviewData.project_id,
      reviewData.semester,
      reviewData.review_type,
      reviewData.venue || null,
      reviewData.date,
      reviewData.time,
      reviewData.meeting_link || null,
      'Not completed'
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      
      if (reviewData.request_id) {
        db.query(
          `UPDATE optional_review_requests 
           SET review_status = 'completed' 
           WHERE request_id = ?`,
          [reviewData.request_id],
          (updateErr) => {
            if (updateErr) console.error('Error updating request status:', updateErr);
            resolve(result);
          }
        );
      } else {
        resolve(result);
      }
    });
  });
};

module.exports = {
    getRequestDetailsById,
    scheduleOptionalReview
}