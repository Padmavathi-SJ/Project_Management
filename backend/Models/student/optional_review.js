const db = require('../../db.js');

// Check if optional reviews are enabled by admin
const isOptionalReviewEnabled = () => {
    const query = `SELECT optional_review_access FROM admin_accesses LIMIT 1`;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if (err) {
                console.error("Error checking optional review access:", err);
                return reject(err);
            }
            
            if (!result || result.length === 0) {
                console.log("No admin access record found");
                return resolve(false);
            }
            
            const isEnabled = result[0].optional_review_access === 'enabled';
            console.log(`Optional review access is ${isEnabled ? 'ENABLED' : 'DISABLED'}`);
            resolve(isEnabled);
        });
    });
};

const getEligibleReviews = async (student_reg_num, semester) => {
  try {
    const tables = semester === '7'
      ? [
          { table: 's7_first_review_marks_byguide', type: 'review-1' },
          { table: 's7_second_review_marks_byguide', type: 'review-2' }
        ]
      : [
          { table: 's5_s6_first_review_marks_byguide', type: 'review-1' },
          { table: 's5_s6_second_review_marks_byguide', type: 'review-2' }
        ];

    let eligibleReviews = [];

    for (const { table, type } of tables) {
      const query = `
        SELECT updated_at, attendance
        FROM ${table}
        WHERE student_reg_num = ? AND semester = ? LIMIT 1
      `;
      const [result] = await new Promise((resolve, reject) => {
        db.query(query, [student_reg_num, semester], (err, res) => {
          if (err) return reject(err);
          resolve(res);
        });
      });

      if (result && result.attendance === 'absent') {
        eligibleReviews.push({
          review_type: type,
          updated_at: result.updated_at
        });
      }
    }

    return eligibleReviews;  // Just return the data, don't handle response here

  } catch (error) {
    console.error("Error fetching eligible reviews:", error);
    throw error;  // Throw the error to be handled by the controller
  }
};


// Check if student is absent in either review-1 or review-2
const isStudentAbsentInAnyReview = (student_reg_num, semester) => {
    console.log(`Checking absence for ${student_reg_num} in semester ${semester}`);
    
    const tables = semester === '7' 
        ? ['s7_first_review_marks_byguide', 's7_second_review_marks_byguide']
        : ['s5_s6_first_review_marks_byguide', 's5_s6_second_review_marks_byguide'];

    console.log(`Checking tables: ${tables.join(', ')}`);

    const queries = tables.map(table => {
        const query = `
            SELECT attendance FROM ${table} 
            WHERE student_reg_num = ? 
            AND semester = ?
            LIMIT 1
        `;
        return new Promise((resolve, reject) => {
            db.query(query, [student_reg_num, semester], (err, result) => {
                if (err) {
                    console.error(`Error checking ${table}:`, err);
                    return reject(err);
                }
                const isAbsent = result.length > 0 && result[0].attendance === 'absent';
                console.log(`${table} result:`, { 
                    recordExists: result.length > 0, 
                    attendance: result[0]?.attendance, 
                    isAbsent 
                });
                resolve(isAbsent);
            });
        });
    });

    return Promise.all(queries)
        .then(results => {
            const isAbsentInAny = results.some(result => result === true);
            console.log(`Final result for ${student_reg_num}:`, { results, isAbsentInAny });
            return isAbsentInAny;
        })
        .catch(error => {
            console.error("Error in isStudentAbsentInAnyReview:", error);
            throw error;
        });
};

// Check if student already has an optional review request for any review type in this semester
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
    getEligibleReviews,
    verifyTeamMembership,
    isOptionalReviewEnabled,
   isStudentAbsentInAnyReview,
    hasExistingRequest,
    createRequest,
    getAllRequests,
    updateRequestStatus
};