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


const getGuideReviews = (guide_reg_num) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        review_id,
        team_id,
        project_id,
        student_reg_num,
        semester,
        review_type,
        CONCAT(date, ' ', time) AS scheduled_time,
        venue,
        meeting_link,
        status,
        'guide' as user_role
      FROM optional_review_schedules_byguide
      WHERE guide_reg_num = ?
      ORDER BY date DESC, time DESC
    `;
    
    db.query(query, [guide_reg_num], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const getSubExpertReviews = (sub_expert_reg_num) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        review_id,
        team_id,
        project_id,
        student_reg_num,
        semester,
        review_type,
        CONCAT(date, ' ', time) AS scheduled_time,
        venue,
        meeting_link,
        status,
        'sub_expert' as user_role
      FROM optional_review_schedules_bysubexpert
      WHERE sub_expert_reg_num = ?
      ORDER BY date DESC, time DESC
    `;
    
    db.query(query, [sub_expert_reg_num], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

const checkUserRole = (user_reg_num) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 'guide' as role FROM optional_review_schedules_byguide WHERE guide_reg_num = ?
      UNION
      SELECT 'sub_expert' as role FROM optional_review_schedules_bysubexpert WHERE sub_expert_reg_num = ?
      LIMIT 1
    `;
    
    db.query(query, [user_reg_num, user_reg_num], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0 ? results[0].role : null);
    });
  });
};


// Helper function to prepare data for insertion
const prepareOptionalMarksData = (data) => {
    const { marks = {}, ...rest } = data;
    return {
        ...rest,
        attendance: 'present', // Always present for optional reviews
        ...marks
    };
};

// Semester 5/6 First Review
const insert_s56_optional_first_review_by_guide = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s5_s6_optional_first_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s56_optional_first_review_by_subexpert = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s5_s6_optional_first_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 5/6 Second Review
const insert_s56_optional_second_review_by_guide = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s5_s6_optional_second_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s56_optional_second_review_by_subexpert = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s5_s6_optional_second_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 7 First Review
const insert_s7_optional_first_review_by_guide = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s7_optional_first_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s7_optional_first_review_by_subexpert = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s7_optional_first_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 7 Second Review
const insert_s7_optional_second_review_by_guide = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s7_optional_second_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s7_optional_second_review_by_subexpert = (data) => {
    const preparedData = prepareOptionalMarksData(data);
    const query = `INSERT INTO s7_optional_second_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};


const getCompletedOptionalReviewStudents = (teamId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        g.student_reg_num,
        g.semester,
        g.review_type
      FROM 
        optional_review_schedules_byguide g
      INNER JOIN 
        optional_review_schedules_bysubexpert s
      ON 
        g.student_reg_num = s.student_reg_num AND
        g.team_id = s.team_id AND
        g.semester = s.semester AND
        g.review_type = s.review_type
      WHERE 
        g.team_id = ? AND 
        g.status = 'Completed' AND 
        s.status = 'Completed'
      GROUP BY 
        g.student_reg_num, g.semester, g.review_type
    `;
    
    db.query(query, [teamId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


module.exports = {
    getRequestDetailsById,
    scheduleOptionalReview,
     getGuideReviews,
  getSubExpertReviews,
  checkUserRole,
    insert_s56_optional_first_review_by_guide,
    insert_s56_optional_first_review_by_subexpert,
    insert_s56_optional_second_review_by_guide,
    insert_s56_optional_second_review_by_subexpert,
    insert_s7_optional_first_review_by_guide,
    insert_s7_optional_first_review_by_subexpert,
    insert_s7_optional_second_review_by_guide,
    insert_s7_optional_second_review_by_subexpert,
    getCompletedOptionalReviewStudents,
}