const db = require('../../db.js');

const getStudentsForScheduling = (user_reg_num) => {
  return new Promise((resolve, reject) => {
    // First check if user is a guide
    const guideQuery = `
      SELECT 
        request_id,
        student_reg_num,
        team_id,
        project_id,
        semester,
        review_type
      FROM optional_review_requests
      WHERE guide_reg_num = ? 
      AND request_status = 'approved'
      ORDER BY created_at DESC
    `;
    
    db.query(guideQuery, [user_reg_num], (err, guideResults) => {
      if (err) return reject(err);
      
      if (guideResults.length > 0) {
        return resolve({ students: guideResults, userType: 'guide' });
      }
      
      // If not a guide, check if user is a sub-expert
      const subExpertQuery = `
        SELECT 
          request_id,
          student_reg_num,
          team_id,
          project_id,
          semester,
          review_type
        FROM optional_review_requests
        WHERE sub_expert_reg_num = ? 
        AND request_status = 'approved'
        ORDER BY created_at DESC
      `;
      
      db.query(subExpertQuery, [user_reg_num], (subErr, subResults) => {
        if (subErr) return reject(subErr);
        resolve({ students: subResults, userType: subResults.length > 0 ? 'sub_expert' : null });
      });
    });
  });
};


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

const scheduleOptionalReview = (reviewData) => {
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!reviewData.review_id || !reviewData.student_reg_num || !reviewData.guide_reg_num || 
        !reviewData.team_id || !reviewData.project_id || !reviewData.semester || 
        !reviewData.review_type || !reviewData.date || !reviewData.time) {
      return reject(new Error('Missing required fields for scheduling review'));
    }

    const query = `
      INSERT INTO optional_review_schedules_bysubexpert (
        review_id, 
        student_reg_num, 
        sub_expert_reg_num, 
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
      reviewData.sub_expert_reg_num,
      reviewData.team_id,
      reviewData.project_id,
      reviewData.semester,
      reviewData.review_type,
      reviewData.venue || null,
      reviewData.date,
      reviewData.time,
      reviewData.meeting_link || null,
      'Not completed' // Initial status
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      
      // Update the request status to 'completed' after scheduling
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
    getStudentsForScheduling,
    getRequestDetailsById,
    scheduleOptionalReview
}