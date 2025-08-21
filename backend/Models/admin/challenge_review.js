const db = require('../../db.js');

// Helper function to promisify db.query with proper error handling
const queryAsync = (sql, params, connection = null) => {
    return new Promise((resolve, reject) => {
        if (!connection && !db) {
            return reject(new Error('Database connection not initialized'));
        }
        
        const queryFn = connection ? connection.query.bind(connection) : db.query.bind(db);
        queryFn(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
};

// Get currently enabled review type from admin_accesses
// Get currently enabled review type from admin_accesses
const getEnabledReviewType = async () => {
    try {
        const query = `
            SELECT challenge_review_type 
            FROM admin_accesses 
            WHERE challenge_review_access = 'enabled'
            LIMIT 1`;
        
        const results = await queryAsync(query);
        return results[0]?.challenge_review_type || null; // Fixed: changed review_type to challenge_review_type
    } catch (error) {
        console.error('Error getting enabled review type:', error);
        throw error;
    }
};

// Get pending challenge review requests for the enabled review type
const getPendingRequests = async (cluster = null) => {
    try {
        const enabledReviewType = await getEnabledReviewType();
        if (!enabledReviewType) {
            return [];
        }

        let query = `
            SELECT * FROM challenge_review_requests
            WHERE review_type = ?
            AND request_status = 'rejected'
            AND review_status = 'Not completed'`;
        
        const params = [enabledReviewType];
        
        if (cluster) {
            query += ` AND cluster = ?`;
            params.push(cluster);
        }

        return await queryAsync(query, params);
    } catch (error) {
        console.error('Error getting pending requests:', error);
        throw error;
    }
};


// Get available staff for a cluster (filtered by designation hierarchy)
const getAvailableStaffForCluster = async (cluster) => {
    try {
        const query = `
            SELECT u.reg_num, u.name, u.staff_designation as designation, u.dept, u.cluster
            FROM users u
            LEFT JOIN challenge_review_reviewers_assignment cra ON 
                (u.reg_num = cra.pmc1_reg_num OR u.reg_num = cra.pmc2_reg_num) 
            WHERE u.role = 'staff'
            AND u.cluster = ?
            AND cra.assignment_id IS NULL
            ORDER BY 
                CASE u.staff_designation
                    WHEN 'head' THEN 1
                    WHEN 'professor' THEN 2
                    WHEN 'Associate Professor' THEN 3
                    WHEN 'Assistant professor level III' THEN 4
                    WHEN 'assistant professor level II' THEN 5
                    WHEN 'assistant professor level I' THEN 6
                    WHEN 'assistant professor' THEN 7
                    ELSE 8
                END`;
        
        return await queryAsync(query, [cluster]);
    } catch (error) {
        console.error('Error getting available staff:', error);
        throw error;
    }
};


// Assign reviewers to requests in batches (batchSize requests per reviewer pair)
// Assign reviewers to requests in batches (batchSize requests per reviewer pair)
const assignReviewersInBatch = async (cluster, batchSize) => {
    let connection;
    try {
        // Get a connection from the pool
        connection = await new Promise((resolve, reject) => {
            db.getConnection((err, conn) => {
                if (err) return reject(err);
                resolve(conn);
            });
        });

        // Start transaction
        await queryAsync('START TRANSACTION', null, connection);

        // Get enabled review type
        const enabledReviewType = await getEnabledReviewType();
        if (!enabledReviewType) {
            throw new Error('No challenge review type is currently enabled');
        }

        // Get pending requests for this cluster
        const pendingRequests = await getPendingRequests(cluster);
        if (pendingRequests.length === 0) {
            return { 
                success: true, 
                message: 'No pending requests for this cluster',
                assignments: [],
                remainingRequests: 0
            };
        }

        // Get available staff for this cluster
        const availableStaff = await getAvailableStaffForCluster(cluster);
        if (availableStaff.length < 2) {
            throw new Error('Not enough available staff for this cluster');
        }

        // Group staff by designation level
        const staffByLevel = {};
        availableStaff.forEach(staff => {
            if (!staffByLevel[staff.designation]) {
                staffByLevel[staff.designation] = [];
            }
            staffByLevel[staff.designation].push(staff);
        });

        const designations = Object.keys(staffByLevel).sort((a, b) => {
            const levels = {
                'head': 1,
                'professor': 2,
                'Associate Professor': 3,
                'Assistant professor level III': 4,
                'assistant professor level II': 5,
                'assistant professor level I': 6,
                'assistant professor': 7
            };
            return (levels[a] || 8) - (levels[b] || 8);
        });

        if (designations.length < 1) {
            throw new Error('No suitable staff designations available');
        }

        const results = [];
        let currentPair = null;
        let requestsAssigned = 0;
        const requestsToProcess = Math.min(batchSize, pendingRequests.length);

        // Get the most senior available PMC1
        let pmc1 = null;
        for (const designation of designations) {
            if (staffByLevel[designation]?.length > 0) {
                pmc1 = staffByLevel[designation].pop();
                break;
            }
        }

        // Get the most junior available PMC2
        let pmc2 = null;
        for (let j = designations.length - 1; j >= 0; j--) {
            const designation = designations[j];
            if (staffByLevel[designation]?.length > 0) {
                pmc2 = staffByLevel[designation].pop();
                break;
            }
        }

        // If no junior found, try any available staff
        if (!pmc2) {
            for (const designation in staffByLevel) {
                if (staffByLevel[designation]?.length > 0) {
                    pmc2 = staffByLevel[designation].pop();
                    break;
                }
            }
        }

        if (!pmc1 || !pmc2) {
            throw new Error('Not enough staff to form a review pair');
        }

        currentPair = { pmc1, pmc2 };

        for (let i = 0; i < requestsToProcess; i++) {
            const request = pendingRequests[i];
            
            try {
                // Insert reviewer assignment
                const assignmentQuery = `
                    INSERT INTO challenge_review_reviewers_assignment (
                        semester, team_id, project_id, project_type, review_type,
                        student_reg_num, pmc1_reg_num, pmc2_reg_num
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
                
                const assignmentResult = await queryAsync(assignmentQuery, [
                    request.semester,
                    request.team_id,
                    request.project_id,
                    request.project_type,
                    enabledReviewType,
                    request.student_reg_num,
                    currentPair.pmc1.reg_num,
                    currentPair.pmc2.reg_num
                ], connection);

                // Update request status
                const updateQuery = `
                    UPDATE challenge_review_requests
                    SET request_status = 'approved',
                        updated_at = CURRENT_TIMESTAMP
                    WHERE request_id = ?`;
                
                await queryAsync(updateQuery, [request.request_id], connection);
                
                results.push(assignmentResult);
                requestsAssigned++;
            } catch (error) {
                await queryAsync('ROLLBACK', null, connection);
                if (connection) connection.release();
                throw error;
            }
        }

        await queryAsync('COMMIT', null, connection);
        if (connection) connection.release();

        const remainingRequests = pendingRequests.length - requestsAssigned;
        return { 
            success: true, 
            message: `Assigned 1 reviewer pair to ${requestsAssigned} requests`,
            assignments: results,
            remainingRequests: remainingRequests
        };

    } catch (error) {
        if (connection) {
            await queryAsync('ROLLBACK', null, connection);
            connection.release();
        }
        console.error('Error in assignReviewersInBatch:', error);
        throw error;
    }
};

module.exports = {
    getEnabledReviewType,
    getPendingRequests,
    getAvailableStaffForCluster,
    assignReviewersInBatch
};