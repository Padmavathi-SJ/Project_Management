const db = require('../../db.js');

const isChallengeReviewEnabled = (review_type) => {
    const query = `
        SELECT challenge_review_access, challenge_review_type 
        FROM admin_accesses 
        WHERE challenge_review_access = 'enabled'
        AND challenge_review_type = ?
        LIMIT 1`;
    
    return new Promise((resolve, reject) => {
        db.query(query, [review_type], (err, result) => {
            if(err) return reject(err);
            resolve(result.length > 0);
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

const checkAttendanceInTable = (table, student_reg_num, semester) => {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT attendance FROM ${table}
        WHERE student_reg_num = ?
        AND semester = ?
        LIMIT 1
        `;
        db.query(query, [student_reg_num, semester], (err, result) => {
            if(err) return reject(err);
            resolve(result.length > 0 && result[0].attendance === 'present');
        });
    });
};

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
        checkAttendanceInTable(table, student_reg_num, semester)
    ))
    .then(results => results.every(result => result === true));
};

const fetchSemester = (student_reg_num) => {
    const query = `
        SELECT semester FROM users 
        WHERE reg_num = ? 
        AND role = 'student'
        AND semester IN (5,6,7,8)
        LIMIT 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [student_reg_num], (err, result) => {
            if(err) return reject(err);
            resolve(result[0]?.semester);
        });
    });
};

const getProjectDetailsWithCluster = async (team_id) => {
    const query = `
        SELECT p.project_id, p.project_type, p.cluster 
        FROM projects p
        WHERE p.team_id = ?
        LIMIT 1
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            if (!result || result.length === 0) {
                return reject(new Error('No project found for this team'));
            }
            resolve(result[0]);
        });
    });
};

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

const submitChallengeReviewRequest = async (requestData) => {
    try{

        const project = await getProjectDetailsWithCluster(requestData.team_id);

    const query = `
        INSERT INTO challenge_review_requests (
            team_id, project_id, project_type, cluster, semester, 
            review_type, student_reg_num, guide_reg_num, 
            sub_expert_reg_num, request_reason, review_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
        requestData.team_id,
        project.project_id,
        project.project_type,
        project.cluster,
        requestData.semester,
        requestData.review_type,
        requestData.student_reg_num,
        requestData.guide_reg_num,
        requestData.sub_expert_reg_num,
        requestData.request_reason,
        'Not completed'
    ];
    
    return new Promise((resolve, reject) => {
        db.query(query, values, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
} catch (error) {
    throw error;
}
};



const getEnabledReviewTypes = () => {
    const query = `
        SELECT challenge_review_type 
        FROM admin_accesses 
        WHERE challenge_review_access = 'enabled'
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            
            // Extract just the review_type values from results
            const enabledTypes = results.map(row => row.challenge_review_type);
            resolve(enabledTypes);
        });
    });
};



module.exports = {
    isChallengeReviewEnabled,
    hasExistingRequest,
    checkReviewTypeAttendance,
    fetchSemester,
    getProjectDetailsWithCluster,
    getTeamDetails,
    submitChallengeReviewRequest,
    getEnabledReviewTypes
};