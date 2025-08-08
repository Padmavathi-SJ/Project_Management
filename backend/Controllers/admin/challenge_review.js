const {
    getEnabledReviewType,
    getPendingRequests,
    getAvailableStaffForCluster,
    assignReviewersInBatch
} = require('../../Models/admin/challenge_review.js');

// Get current status of challenge review assignments
const getAssignmentStatus = async (req, res) => {
    try {
        const enabledReviewType = await getEnabledReviewType();
        if (!enabledReviewType) {
            return res.status(400).json({
                success: false,
                message: 'No challenge review type is currently enabled'
            });
        }

        // Get pending requests grouped by cluster
        const pendingRequests = await getPendingRequests();
        const clusters = [...new Set(pendingRequests.map(req => req.cluster))];

        const clusterStats = await Promise.all(clusters.map(async cluster => {
            const requests = pendingRequests.filter(req => req.cluster === cluster);
            const availableStaff = await getAvailableStaffForCluster(cluster);
            
            // Filter out null designations and get unique values
            const designations = [...new Set(
                availableStaff
                    .map(staff => staff.designation)
                    .filter(designation => designation !== null)
            )];
            
            return {
                cluster,
                pendingRequests: requests.length,
                availableStaff: availableStaff.length,
                staffDesignations: designations.length > 0 ? designations : []
            };
        }));

        res.status(200).json({
            success: true,
            enabledReviewType,
            clusterStats,
            totalPendingRequests: pendingRequests.length
        });

    } catch (error) {
        console.error('Error getting assignment status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get assignment status'
        });
    }
};

// Assign reviewers to pending requests in batches
const assignReviewersBatch = async (req, res) => {
    const { cluster, batchSize } = req.body;

    if (!cluster || !batchSize) {
        return res.status(400).json({
            success: false,
            message: 'Cluster and batchSize parameters are required'
        });
    }

    try {
        const result = await assignReviewersInBatch(cluster, parseInt(batchSize));
        
        res.status(200).json({
            success: true,
            message: result.message,
            assignments: result.assignments,
            remainingRequests: result.remainingRequests
        });

    } catch (error) {
        console.error('Error assigning reviewers:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to assign reviewers'
        });
    }
};

// Get pending requests for a specific cluster
const getClusterPendingRequests = async (req, res) => {
    const { cluster } = req.params;

    if (!cluster) {
        return res.status(400).json({
            success: false,
            message: 'Cluster parameter is required'
        });
    }

    try {
        const requests = await getPendingRequests(cluster);
        
        res.status(200).json({
            success: true,
            requests,
            count: requests.length
        });

    } catch (error) {
        console.error('Error getting cluster requests:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cluster requests'
        });
    }
};

// Get available staff for a specific cluster
const getClusterAvailableStaff = async (req, res) => {
    const { cluster } = req.params;

    if (!cluster) {
        return res.status(400).json({
            success: false,
            message: 'Cluster parameter is required'
        });
    }

    try {
        const staff = await getAvailableStaffForCluster(cluster);
        
        res.status(200).json({
            success: true,
            staff,
            count: staff.length
        });

    } catch (error) {
        console.error('Error getting cluster staff:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get cluster staff'
        });
    }
};

module.exports = {
    getAssignmentStatus,
    assignReviewersBatch,
    getClusterPendingRequests,
    getClusterAvailableStaff
};