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
    select count(*) from challenge_review_requests
    where student_reg_num = ? and semester = ?
    `;

    return new Promise((resolve, reject) => {
        db.query(query, [student_reg_num, semester], (err, result) => {
            if(err) return reject(err);
            resolve(result[0].count > 0);
        })
    })
}


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

module.exports = {
    isStudentPresentInAllReviews,
    isChallengeReviewEnabled,
    hasExistingRequest
}