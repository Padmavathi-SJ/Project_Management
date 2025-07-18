const db = require('../../db.js');

// Get requests where user is guide or sub-expert
const getRequestsByUser = (user_reg_num) => {
  return new Promise((resolve, reject) => {
    // First check if user is a guide
    const guideQuery = `
      SELECT * FROM optional_review_requests
      WHERE guide_reg_num = ?
      ORDER BY created_at DESC
    `;
    
    db.query(guideQuery, [user_reg_num], (err, guideResults) => {
      if (err) return reject(err);
      
      if (guideResults.length > 0) {
        return resolve({ requests: guideResults, userType: 'guide' });
      }
      
      // If not a guide, check if user is a sub-expert
      const subExpertQuery = `
        SELECT * FROM optional_review_requests
        WHERE sub_expert_reg_num = ?
        ORDER BY created_at DESC
      `;
      
      db.query(subExpertQuery, [user_reg_num], (subErr, subResults) => {
        if (subErr) return reject(subErr);
        
        if (subResults.length > 0) {
          return resolve({ requests: subResults, userType: 'sub_expert' });
        }
        
        // If no requests found for either role
        resolve({ requests: [], userType: null });
      });
    });
  });
};

// Update request status
const updateRequestStatusModel = (request_id, status, rejection_reason = null) => {
  return new Promise((resolve, reject) => {
    const updateQuery = `
      UPDATE optional_review_requests
      SET request_status = ?,
          rejection_reason = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE request_id = ?
    `;
    
    db.query(updateQuery, [status, rejection_reason, request_id], (err, result) => {
      if (err) return reject(err);
      
      // Fetch the updated record
      const selectQuery = `
        SELECT * FROM optional_review_requests
        WHERE request_id = ?
      `;
      
      db.query(selectQuery, [request_id], (selectErr, selectResult) => {
        if (selectErr) return reject(selectErr);
        resolve(selectResult[0]);
      });
    });
  });
};

// Get approved optional review requests
const getApprovedOptionalRequests = (user_reg_num, user_type) => {
  return new Promise((resolve, reject) => {
    const column = user_type === 'guide' ? 'guide_reg_num' : 'sub_expert_reg_num';
    const query = `
      SELECT * FROM optional_review_requests
      WHERE ${column} = ? AND request_status = 'approved'
    `;
    
    db.query(query, [user_reg_num], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};


// Fetch students for scheduling based on user type
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




module.exports = {
  getRequestsByUser,
  updateRequestStatusModel,
  getApprovedOptionalRequests,
  getStudentsForScheduling
};