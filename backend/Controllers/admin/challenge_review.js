const {
    getChallengeReviewRequestsCount,
    getAvailablePMCReviewers,
    getUnassignedRequests,
    assignReviewers,
    updateRequestStatus,
    getStaffCountsByDept
} = require('../../Models/admin/challenge_review.js');


// Get challenge review statistics for admin dashboard
const getReviewStatistics = async (req, res) => {
    try {
        const [stats, staffCounts] = await Promise.all([
            getChallengeReviewRequestsCount(),
            getStaffCountsByDept()
        ]);
        
        // Organize by dept
        const deptStats = {};
        stats.forEach(item => {
            if (!deptStats[item.dept]) {
                deptStats[item.dept] = {
                    dept: item.dept,
                    review1: 0,
                    review2: 0,
                    total: 0,
                    staffCount: staffCounts[item.dept] || 0
                };
            }
            
            if (item.review_type === 'review-1') {
                deptStats[item.dept].review1 = item.count;
            } else {
                deptStats[item.dept].review2 = item.count;
            }
            
            deptStats[item.dept].total += item.count;
        });
        
        res.status(200).json({
            success: true,
            data: Object.values(deptStats)
        });
    } catch (error) {
        console.error('Error getting review statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get review statistics'
        });
    }
};

// Assign reviewers based on ratio

const assignReviewersByRatio = async (req, res) => {
    const { dept, review_type, ratio } = req.body;
    
    try {
        // Validate input
        if (!dept || !review_type || !ratio || !ratio.students || !ratio.reviewers) {
            return res.status(400).json({
                success: false,
                message: 'Department, review type, and ratio (students and reviewers) are required'
            });
        }
        
        // Get available PMC reviewers for this dept
        const reviewers = await getAvailablePMCReviewers(dept);
        console.log('Available reviewers:', reviewers);
        
        if (reviewers.length < 2) {
            return res.status(400).json({
                success: false,
                message: `Not enough available reviewers in ${dept} department (found ${reviewers.length}, need at least 2)`,
                available_reviewers: reviewers
            });
        }
        
        // Get unassigned requests
        const requests = await getUnassignedRequests(
            dept, 
            review_type, 
            ratio.students
        );
        
        if (requests.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No unassigned requests found for this department and review type'
            });
        }
        
        // Prepare assignments
        const assignments = requests.map((request, index) => {
            // Alternate between reviewer pairs if we have more than 2
            const reviewerPairIndex = Math.floor(index / ratio.students) * 2;
            const pmc1 = reviewers[reviewerPairIndex % reviewers.length];
            const pmc2 = reviewers[(reviewerPairIndex + 1) % reviewers.length];
            
            return {
                ...request,
                pmc1_reg_num: pmc1.reg_num,
                pmc2_reg_num: pmc2.reg_num
            };
        });
        
        // Save assignments to database
        await assignReviewers(assignments);
        
       
        // Update request status
        const requestIds = requests.map(r => r.request_id);
        await updateRequestStatus(requestIds);
        

        res.status(200).json({
            success: true,
            message: `Successfully assigned reviewers to ${assignments.length} requests`,
            data: {
                assignments,
                ratioUsed: `${ratio.students}:${ratio.reviewers}`
            }
        });
        
    } catch (error) {
        console.error('Detailed error:', {
            message: error.message,
            stack: error.stack,
            sql: error.sql
        });
        res.status(500).json({
            success: false,
            message: 'Failed to assign reviewers',
            error: error.message,
            sqlError: error.sqlMessage
        });
    }
};

// Helper function to get count of unassigned requests
const getUnassignedRequestsCount = async (dept, review_type) => {
    const query = `
        SELECT COUNT(*) as count
        FROM challenge_review_requests crr
        LEFT JOIN challenge_review_reviewers_assignment cra ON (
            crr.student_reg_num = cra.student_reg_num 
            AND crr.semester = cra.semester
            AND crr.review_type = cra.review_type
        )
        WHERE crr.cluster = ?
        AND crr.review_type = ?
        AND crr.review_status = 'Not completed'
        AND cra.assignment_id IS NULL
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [dept, review_type], (err, results) => {
            if (err) return reject(err);
            resolve(results[0].count);
        });
    });
};

module.exports = {
    getReviewStatistics,
    assignReviewersByRatio
};