const db = require('../../db.js');

// Helper function to prepare data for insertion
const prepareChallengeMarksData = (data) => {
    const { marks = {}, attendance = 'present', ...rest } = data;
    
    const baseData = {
        ...rest,
        attendance
    };

    // For absent students, set all marks to null
    if (attendance === 'absent') {
        return {
            ...baseData,
            literature_review: null,
            Aim_Objective_of_the_project: null,
            Scope_of_the_project: null,
            Need_for_the_current_study: null,
            Proposed_Methodology: null,
            Project_work_Plan: null,
            Oral_Presentation: null,
            Viva_Voce_PPT: null,
            Contributions_to_the_work_and_worklog: null
        };
    }

    // For present students, include all marks
    return {
        ...baseData,
        ...marks
    };
};

// Get completed challenge reviews for a team
const getCompletedChallengeReviews = (teamId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        student_reg_num,
        semester,
        review_type
      FROM 
        challenge_review_schedules 
      WHERE 
        team_id = ? AND 
        pmc1_review_status = 'Completed' AND 
        pmc2_review_status = 'Completed'
      GROUP BY 
        student_reg_num, semester, review_type
    `;
    
    db.query(query, [teamId], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });
};

// Semester 5/6 First Review
const insert_s56_challenge_first_review_by_pmc1 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s5_s6_challenge_first_review_marks_bypmc1 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s56_challenge_first_review_by_pmc2 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s5_s6_challenge_first_review_marks_bypmc2 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 5/6 Second Review
const insert_s56_challenge_second_review_by_pmc1 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s5_s6_challenge_second_review_marks_bypmc1 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s56_challenge_second_review_by_pmc2 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s5_s6_challenge_second_review_marks_bypmc2 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 7 First Review
const insert_s7_challenge_first_review_by_pmc1 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s7_challenge_first_review_marks_bypmc1 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s7_challenge_first_review_by_pmc2 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s7_challenge_first_review_marks_bypmc2 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

// Semester 7 Second Review
const insert_s7_challenge_second_review_by_pmc1 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s7_challenge_second_review_marks_bypmc1 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

const insert_s7_challenge_second_review_by_pmc2 = (data) => {
    const preparedData = prepareChallengeMarksData(data);
    const query = `INSERT INTO s7_challenge_second_review_marks_bypmc2 SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [preparedData], (err, result) => {
            if(err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    getCompletedChallengeReviews,
    insert_s56_challenge_first_review_by_pmc1,
    insert_s56_challenge_first_review_by_pmc2,
    insert_s56_challenge_second_review_by_pmc1,
    insert_s56_challenge_second_review_by_pmc2,
    insert_s7_challenge_first_review_by_pmc1,
    insert_s7_challenge_first_review_by_pmc2,
    insert_s7_challenge_second_review_by_pmc1,
    insert_s7_challenge_second_review_by_pmc2
};