const db = require('../../db.js');

// Get challenge review requests count by dept and review type
const getChallengeReviewRequestsCount = () => {
    const query = `
        SELECT 
            cluster as dept, 
            review_type, 
            COUNT(*) as count
        FROM 
            challenge_review_requests
        WHERE 
            review_status = 'Not completed'
        GROUP BY 
            cluster, review_type
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Get available PMC reviewers by dept
const getAvailablePMCReviewers = (dept) => {
    const query = `
        SELECT 
            u.reg_num, 
            u.name,
            COUNT(cra.assignment_id) as current_assignments
        FROM 
            users u
        LEFT JOIN 
            challenge_review_reviewers_assignment cra ON (
                (cra.pmc1_reg_num = u.reg_num OR cra.pmc2_reg_num = u.reg_num)
            )
        WHERE 
            u.role = 'staff' 
            AND u.dept = ?
            AND u.available = 1
        GROUP BY 
            u.reg_num, u.name
        ORDER BY 
            current_assignments ASC
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [dept], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Get unassigned challenge review requests by dept and review type
const getUnassignedRequests = (dept, review_type, limit) => {
    const query = `
        SELECT 
            crr.request_id,
            crr.team_id,
            crr.project_id,
            crr.project_type,
            crr.semester,
            crr.review_type,
            crr.student_reg_num
        FROM 
            challenge_review_requests crr
        LEFT JOIN 
            challenge_review_reviewers_assignment cra ON (
                crr.student_reg_num = cra.student_reg_num 
                AND crr.semester = cra.semester
                AND crr.review_type = cra.review_type
            )
        WHERE 
            crr.cluster = ?
            AND crr.review_type = ?
            AND crr.review_status = 'Not completed'
            AND cra.assignment_id IS NULL
        LIMIT ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [dept, review_type, limit], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Assign reviewers to requests

const assignReviewers = (assignments) => {
    // Fix the table name (was missing an 'e' in "challenge_review_reviewers_assignment")
    const query = `
        INSERT INTO challenge_review_reviewers_assignment (
            semester, team_id, project_id, project_type, review_type,
            student_reg_num, pmc1_reg_num, pmc2_reg_num
        ) VALUES ?
    `;
    
    const values = assignments.map(assignment => [
        assignment.semester,
        assignment.team_id,
        assignment.project_id,
        assignment.project_type,
        assignment.review_type,
        assignment.student_reg_num,
        assignment.pmc1_reg_num,
        assignment.pmc2_reg_num
    ]);
    
    return new Promise((resolve, reject) => {
        db.query(query, [values], (err, result) => {
            if (err) {
                console.error('SQL Error in assignReviewers:', err);
                return reject(err);
            }
            resolve(result);
        });
    });
};

// Update request status to 'Completed' after assignment
const updateRequestStatus = (request_ids) => {
    const query = `
        UPDATE challenge_review_requests
        SET review_status = 'Completed'
        WHERE request_id IN (?)
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [request_ids], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

module.exports = {
    getChallengeReviewRequestsCount,
    getAvailablePMCReviewers,
    getUnassignedRequests,
    assignReviewers,
    updateRequestStatus
};