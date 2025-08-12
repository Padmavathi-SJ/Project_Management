const db = require('../../db.js');

const getSubExpertStudents = (sub_expert_reg_num) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        request_id,
        student_reg_num,
        team_id,
        project_id,
        semester,
        review_type,
        'sub_expert' as user_role
      FROM optional_review_requests
      WHERE sub_expert_reg_num = ? 
      AND request_status = 'approved'
      ORDER BY created_at DESC
    `;
    
    db.query(query, [sub_expert_reg_num], (err, results) => {
      if (err) return reject(err);
      resolve(results);
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

const updateSubExpertReviewStatus = (reviewId, subExpertRegNum, newStatus) => {
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE optional_review_schedules
      SET sub_expert_review_status = ?
      WHERE review_id = ? AND sub_expert_reg_num = ?
    `;
    
    db.query(query, [newStatus, reviewId, subExpertRegNum], (err, result) => {
      if (err) return reject(err);
      if (result.affectedRows === 0) {
        return reject(new Error('No sub-expert review found with the given ID and registration number'));
      }
      resolve(result);
    });
  });
};

const getSubExpertReviewById = (reviewId, subExpertRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM optional_review_schedules
      WHERE review_id = ? AND sub_expert_reg_num = ?
    `;
    
    db.query(query, [reviewId, subExpertRegNum], (err, result) => {
      if (err) return reject(err);
      if (result.length === 0) {
        return reject(new Error('Sub-expert review not found'));
      }
      resolve(result[0]);
    });
  });
};



module.exports = {
    getSubExpertStudents,
    getRequestDetailsById,
    scheduleOptionalReview,
    updateSubExpertReviewStatus,
    getSubExpertReviewById
}