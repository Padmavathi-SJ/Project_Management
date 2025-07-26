const db = require('../../db.js');

const isChallengeReviewEnabled = () => {
    const query = `SELECT challenge_review_access FROM admin_accesses LIMIT 1`;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, result) => {
            if(err) return reject(err);
            resolve(result[0]?.challenge_review_access === 'enabled');
        });
    });
};

const hasExistingRequest = (student_reg_num, semester) => {
    const query = `
        SELECT COUNT(*) as count 
        FROM challenge_review_requests
        WHERE student_reg_num = ? AND semester = ?
    `;

    return new Promise((resolve, reject) => {
        db.query(query, [student_reg_num, semester], (err, result) => {
            if(err) return reject(err);
            resolve(result[0].count > 0);
        });
    });
};




const checkAttendanceInTable = (table, student_reg_num, semester, review_type) => {
    return new Promise((resolve, reject) => {
        const query = `
        select attendance from ${table}
        where student_reg_num = ?
        and semester = ?
        and review_type = ?
        limit 1
        `;
        db.query(query, [student_reg_num, semester, review_type], (err, result) => {
            if(err) return reject(err);
            resolve(result.length > 0 && result[0].attendance === 'present');
        })
    })
}

const checkReviewTypeAttendance = (student_reg_num, semester, review_type) => {
    const tables = semester === '7'
        ? [
            `s7_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_byguide`,
            `s7_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_bysubexpert`
        ]
        : [
            `s5_s6_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_byguide`,
            `s5_s6_${review_type === 'review-1' ? 'first' : 'second'}_review_marks_bysubexpert`
        ];

    return Promise.all(tables.map(table => 
        checkAttendanceInTable(table, student_reg_num, semester, review_type)
    ))
    .then(results => results.every(result => result === true));
};

const isStudentPresentInAllReviews = (student_reg_num, semester) => {
    return Promise.all([
        checkReviewTypeAttendance(student_reg_num, semester, 'review-1'),
        checkReviewTypeAttendance(student_reg_num, semester, 'review-2')
    ])
    .then(([review1, review2]) => review1 && review2)
    .catch(err => {
        console.error('Error checking student attendance:', err);
        throw err;
    })
}

const fetchSemester = (student_reg_num) => {
    const query = `
            select semester from users 
            where reg_num = ? 
            and role = 'student'
            and semester in (5,6,7,8)
            limit 1
            `;
    return new Promise((resolve, reject) => {
        db.query(query, [student_reg_num], (err, result) => {
            if(err) return reject(err);
            resolve(result[0]?.semester);
        })
    })
}



// Get project details by team_id
const getProjectDetails = (team_id) => {
    const query = `
        SELECT project_id, project_type, cluster 
        FROM projects 
        WHERE team_id = ?
        LIMIT 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null);
        });
    });
};

// Get team members and guide info
const getTeamDetails = (team_id) => {
    const query = `
        SELECT guide_reg_num, sub_expert_reg_num 
        FROM teams 
        WHERE team_id = ?
        LIMIT 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            resolve(result[0] || null);
        });
    });
};

// Submit challenge review request
const submitChallengeReviewRequest = (requestData) => {
    const query = `
        INSERT INTO challenge_review_requests (
            team_id, project_id, project_type, cluster, semester, 
            review_type, student_reg_num, guide_reg_num, 
            sub_expert_reg_num, request_reason, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        requestData.team_id,
        requestData.project_id,
        requestData.project_type,
        requestData.cluster,
        requestData.semester,
        requestData.review_type,
        requestData.student_reg_num,
        requestData.guide_reg_num,
        requestData.sub_expert_reg_num,
        requestData.request_reason,
        'Not completed' // Default status
    ];
    
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};



module.exports = {
    isStudentPresentInAllReviews,
    isChallengeReviewEnabled,
    hasExistingRequest,
    fetchSemester,
    getProjectDetails,
    getTeamDetails,
    submitChallengeReviewRequest
}