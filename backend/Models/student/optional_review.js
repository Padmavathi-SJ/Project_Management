const db = require('../../db.js');

// Check if optional reviews are enabled by admin
const isOptionalReviewEnabled = () => {
    const query = `SELECT optional_review_access FROM admin_accesses LIMIT 1`;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result[0]?.optional_review_access === 'enabled');
        });
    });
};

// Check if student is absent in both evaluations
const isStudentAbsent = (student_reg_num, semester, review_type) => {
    // Only check tables for the specific semester
    const tables = semester === '7' 
        ? [
            `s7_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_byguide`,
            `s7_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_bysubexpert`
        ]
        : [
            `s5_s6_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_byguide`,
            `s5_s6_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_bysubexpert`
        ];

    const queries = tables.map(table => {
        const query = `
            SELECT attendance FROM ${table} 
            WHERE student_reg_num = ? 
            AND semester = ?
            AND review_type = ?
            LIMIT 1
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [student_reg_num, semester, review_type], (err, result) => {
                if (err) return reject(err);
                resolve(result.length > 0 && result[0].attendance === 'absent');
            });
        });
    });

    return Promise.all(queries)
        .then(results => results.every(result => result === true))
        .catch(err => {
            console.error('Error checking student attendance:', err);
            throw err;
        });
};

// Check if student already has an optional review request
const hasExistingRequest = (student_reg_num, semester) => {
    const query = `
        SELECT COUNT(*) as count FROM optional_review_requests
        WHERE student_reg_num = ? AND semester = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [student_reg_num, semester], (err, result) => {
            if (err) return reject(err);
            resolve(result[0].count > 0);
        });
    });
};

const getTeamDetails = (team_id) => {
    const query = `
        SELECT 
            t.team_id,
            t.project_id,
            t.guide_reg_num,
            t.sub_expert_reg_num,
            t.semester,
            p.project_name
        FROM teams t
        LEFT JOIN projects p ON t.project_id = p.project_id
        WHERE t.team_id = ?
        LIMIT 1
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null);
        });
    });
};

// Get all team members for a team
const getTeamMembers = (team_id) => {
    const query = `
        SELECT reg_num, is_leader 
        FROM teams 
        WHERE team_id = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Verify student belongs to team
const verifyTeamMembership = (team_id, student_reg_num) => {
    const query = `
        SELECT COUNT(*) as count 
        FROM teams 
        WHERE team_id = ? AND reg_num = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id, student_reg_num], (err, result) => {
            if (err) return reject(err);
            resolve(result[0].count > 0);
        });
    });
};

// Create new optional review request
const createRequest = (requestData) => {
  const query = `
    INSERT INTO optional_review_requests (
      team_id, project_id, semester, review_type, 
      student_reg_num, guide_reg_num, sub_expert_reg_num, 
      request_reason, request_status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
  `;
  
  const params = [
    requestData.team_id,
    requestData.project_id,
    requestData.semester,
    requestData.review_type,
    requestData.student_reg_num,
    requestData.guide_reg_num,
    requestData.sub_expert_reg_num,
    requestData.request_reason
  ];

  return new Promise((resolve, reject) => {
    db.query(query, params, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return reject(err);
      }
      resolve(result);
    });
  });
};



// Get all optional review requests (for admin view)
const getAllRequests = () => {
    const query = `
        SELECT * FROM optional_review_requests
        ORDER BY created_at DESC
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Update request status (for admin)
const updateRequestStatus = (request_id, status, rejection_reason = null) => {
    const query = `
        UPDATE optional_review_requests
        SET request_status = ?, 
            rejection_reason = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE request_id = ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [status, rejection_reason, request_id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    getTeamDetails,
    getTeamMembers,
    verifyTeamMembership,
    isOptionalReviewEnabled,
    isStudentAbsent,
    hasExistingRequest,
    createRequest,
    getAllRequests,
    updateRequestStatus
};