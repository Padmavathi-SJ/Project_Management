const {
    getAvailableClusters,
    getDepartmentsInCluster,
    getAvailableStaffByCluster,
    getUnassignedRequestsByCluster,
    assignReviewers,
    updateRequestStatus,
    getReviewStatisticsByCluster
} = require('../../Models/admin/challenge_review.js');

// Get cluster statistics for challenge reviews
const getClusterStatistics = async (req, res) => {
    try {
        const stats = await getReviewStatisticsByCluster();
        const clusters = await getAvailableClusters();
        
        // Get departments for each cluster
        const clusterData = await Promise.all(clusters.map(async cluster => {
            const departments = await getDepartmentsInCluster(cluster);
            const clusterStat = stats.find(stat => stat.cluster === cluster) || {
                cluster,
                review1: 0,
                review2: 0,
                total: 0
            };
            
            return {
                ...clusterStat,
                departments
            };
        }));
        
        res.status(200).json({
            success: true,
            data: clusterData
        });
    } catch (error) {
        console.error('Error getting cluster statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cluster statistics',
            error: error.message
        });
    }
};

// Assign reviewers by ratio
const assignReviewersByRatio = async (req, res) => {
    const { cluster, review_type, ratio } = req.body;
    
    try {
        // Validate input
        if (!cluster || !review_type || !ratio || isNaN(ratio.requests) || isNaN(ratio.reviewers)) {
            return res.status(400).json({
                success: false,
                message: 'Cluster, review type, and ratio (requests and reviewers) are required'
            });
        }
        
        // Get available reviewer pairs for the cluster
        const reviewerPairs = await getAvailableStaffByCluster(cluster);
        if (reviewerPairs.length === 0) {
            return res.status(400).json({
                success: false,
                message: `No available reviewer pairs found in cluster ${cluster}`
            });
        }
        
        // Calculate how many requests we can assign based on the ratio
        const requestsToAssign = ratio.requests * Math.floor(reviewerPairs.length / ratio.reviewers);
        if (requestsToAssign <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Not enough reviewer pairs for the requested ratio'
            });
        }
        
        // Get unassigned requests
        const requests = await getUnassignedRequestsByCluster(
            cluster, 
            review_type, 
            requestsToAssign
        );
        
        if (requests.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No unassigned requests found for this cluster and review type'
            });
        }
        
        // Prepare assignments
        const assignments = [];
        const assignmentsPerPair = Math.floor(requests.length / ratio.reviewers);
        
        for (let i = 0; i < requests.length; i++) {
            const pairIndex = Math.floor(i / assignmentsPerPair) % reviewerPairs.length;
            const pair = reviewerPairs[pairIndex];
            
            assignments.push({
                ...requests[i],
                pmc1_reg_num: pair.pmc1.reg_num,  // Junior as PMC1
                pmc2_reg_num: pair.pmc2.reg_num   // Senior as PMC2
            });
        }
        
        // Save assignments to database
        await assignReviewers(assignments);
        
        // Update request status
        const requestIds = requests.map(r => r.request_id);
        await updateRequestStatus(requestIds);
        
        res.status(200).json({
            success: true,
            message: `Successfully assigned ${assignments.length} requests using ${reviewerPairs.length} reviewer pairs`,
            data: {
                cluster,
                review_type,
                ratio_applied: `${ratio.requests} requests : ${ratio.reviewers} reviewer pairs`,
                assignments_made: assignments.length,
                reviewer_pairs_used: reviewerPairs.length
            }
        });
        
    } catch (error) {
        console.error('Error in reviewer assignment:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to assign reviewers',
            error: error.message
        });
    }
};

module.exports = {
    getClusterStatistics,
    assignReviewersByRatio
};