const db = require('../../db.js');

// Get all available clusters
const getAvailableClusters = () => {
    const query = `
        SELECT DISTINCT cluster 
        FROM users 
        WHERE cluster IS NOT NULL
        AND role = 'staff'
        AND available = 1
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            resolve(results.map(row => row.cluster));
        });
    });
};

// Get departments in a cluster
const getDepartmentsInCluster = (cluster) => {
    const query = `
        SELECT DISTINCT dept 
        FROM users 
        WHERE cluster = ?
        AND role = 'staff'
        AND available = 1
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [cluster], (err, results) => {
            if (err) return reject(err);
            resolve(results.map(row => row.dept));
        });
    });
};

// Get available staff by cluster with seniority pairing
const getAvailableStaffByCluster = (cluster) => {
    const query = `
        SELECT 
            u.reg_num, 
            u.name,
            u.dept,
            u.staff_designation,
            u.seniority_level,
            COUNT(cra.assignment_id) as current_assignments
        FROM 
            users u
        LEFT JOIN 
            challenge_review_reviewers_assignment cra ON (
                (cra.pmc1_reg_num = u.reg_num OR cra.pmc2_reg_num = u.reg_num)
            )
        WHERE 
            u.role = 'staff' 
            AND u.cluster = ?
            AND u.available = 1
        GROUP BY 
            u.reg_num, u.name, u.dept, u.staff_designation, u.seniority_level
        ORDER BY 
            u.seniority_level ASC
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [cluster], (err, results) => {
            if (err) return reject(err);
            
            // Pair senior and junior staff
            const pairedReviewers = [];
            const sortedReviewers = [...results].sort((a, b) => a.seniority_level - b.seniority_level);
            
            // Create pairs by matching highest seniority with lowest
            while (sortedReviewers.length >= 2) {
                const senior = sortedReviewers.pop(); // Highest seniority
                const junior = sortedReviewers.shift(); // Lowest seniority
                pairedReviewers.push({
                    pmc1: junior,  // Junior as PMC1
                    pmc2: senior    // Senior as PMC2
                });
            }
            
            // If odd number, add remaining as a single reviewer pair
            if (sortedReviewers.length === 1) {
                const remaining = sortedReviewers[0];
                pairedReviewers.push({
                    pmc1: remaining,
                    pmc2: remaining
                });
            }
            
            resolve(pairedReviewers);
        });
    });
};

// Get unassigned challenge review requests by cluster and review type
const getUnassignedRequestsByCluster = (cluster, review_type, limit) => {
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
            AND crr.request_status = 'approved'
            AND cra.assignment_id IS NULL
        LIMIT ?
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [cluster, review_type, limit], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Assign reviewers to requests
const assignReviewers = (assignments) => {
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

// Update request status after assignment
const updateRequestStatus = (request_ids) => {
    const query = `
        UPDATE challenge_review_requests
        SET review_status = 'Assigned'
        WHERE request_id IN (?)
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [request_ids], (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Get challenge review statistics by cluster
const getReviewStatisticsByCluster = () => {
    const query = `
        SELECT 
            cluster,
            review_type, 
            COUNT(*) as count
        FROM 
            challenge_review_requests
        WHERE 
            review_status = 'Not completed'
            AND request_status = 'approved'
        GROUP BY 
            cluster, review_type
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, (err, results) => {
            if (err) return reject(err);
            
            // Organize by cluster
            const clusterStats = {};
            results.forEach(item => {
                if (!clusterStats[item.cluster]) {
                    clusterStats[item.cluster] = {
                        cluster: item.cluster,
                        review1: 0,
                        review2: 0,
                        total: 0
                    };
                }
                
                if (item.review_type === 'review-1') {
                    clusterStats[item.cluster].review1 = item.count;
                } else {
                    clusterStats[item.cluster].review2 = item.count;
                }
                
                clusterStats[item.cluster].total += item.count;
            });
            
            resolve(Object.values(clusterStats));
        });
    });
};

module.exports = {
    getAvailableClusters,
    getDepartmentsInCluster,
    getAvailableStaffByCluster,
    getUnassignedRequestsByCluster,
    assignReviewers,
    updateRequestStatus,
    getReviewStatisticsByCluster
};