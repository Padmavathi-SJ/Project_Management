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

const getSubExpertFromTeam = (team_id) => {
  return new Promise((resolve, reject) => {
    const query = `select sub_expert_reg_num from
                  teams where team_id = ?
                  `;
        
      db.query(query, [team_id], (err, results) => {
        if(err) return reject(err);
        resolve(results[0].sub_expert_reg_num);
      })
  })
}

const scheduleOptionalReview = (reviewData) => {
  return new Promise((resolve, reject) => {
    // Validate required fields
    if (!reviewData.review_id || !reviewData.student_reg_num || !reviewData.guide_reg_num ||
        !reviewData.team_id || !reviewData.project_id || !reviewData.semester || 
        !reviewData.review_type || !reviewData.review_mode || !reviewData.date || 
        !reviewData.start_time || !reviewData.end_time) {
      return reject(new Error('Missing required fields for scheduling review'));
    }

    // Validate review mode specific fields
    if (reviewData.review_mode === 'online' && !reviewData.meeting_link) {
      return reject(new Error('Meeting link is required for online reviews'));
    }

    if (reviewData.review_mode === 'offline' && !reviewData.venue) {
      return reject(new Error('Venue is required for offline reviews'));
    }

    const query = `
      INSERT INTO optional_review_schedules (
        review_id, 
        student_reg_num, 
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
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      reviewData.review_id,
      reviewData.student_reg_num,
      reviewData.guide_reg_num, // Now properly included
      reviewData.sub_expert_reg_num,
      reviewData.team_id,
      reviewData.project_id,
      reviewData.semester,
      reviewData.review_type,
      reviewData.review_mode,
      reviewData.venue || null,
      reviewData.date,
      reviewData.start_time,
      reviewData.end_time,
      reviewData.meeting_link || null
    ];

    db.query(query, values, (err, result) => {
      if (err) return reject(err);
      resolve(result);
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
        review_mode,
        CONCAT(date, ' ', start_time, ' ', end_time) AS scheduled_time,
        venue,
        meeting_link,
        guide_review_status,
        'guide' as user_role
      FROM optional_review_schedules
      WHERE guide_reg_num = ?
      ORDER BY date DESC, start_time DESC
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
        review_mode,
        CONCAT(date, ' ', start_time, ' ', end_time) AS scheduled_time,
        venue,
        meeting_link,
        sub_expert_review_status,
        'sub_expert' as user_role
      FROM optional_review_schedules
      WHERE sub_expert_reg_num = ?
      ORDER BY date DESC, start_time DESC
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
      SELECT 'guide' as role FROM optional_review_schedules WHERE guide_reg_num = ?
      UNION
      SELECT 'sub_expert' as role FROM optional_review_schedules WHERE sub_expert_reg_num = ?
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
        student_reg_num,
        semester,
        review_type
      FROM 
        optional_review_schedules 
      WHERE 
        team_id = ? AND 
        guide_review_status = 'Completed' AND 
        sub_expert_review_status = 'Completed'
      GROUP BY 
        student_reg_num, semester, review_type
    `;
    
    db.query(query, [teamId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};


module.exports = {
    getRequestDetailsById,
    getSubExpertFromTeam,
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