import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';

const ApplyChallengeReview = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        semester: '',
        review_type: '',
        team_id: '',
        student_reg_num: '',
        request_reason: '',
        project_id: '',
        project_type: '',
        cluster: '',
        guide_reg_num: '',
        sub_expert_reg_num: ''
    });
    const [loading, setLoading] = useState(false);
    const [fetchingDetails, setFetchingDetails] = useState(false);
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [enabledReviewTypes, setEnabledReviewTypes] = useState([]);

    // Fetch enabled review types on component mount
useEffect(() => {
    const fetchEnabledTypes = async () => {
        try {
            const response = await axiosInstance.get('/api/challenge-reviews/enabled-review-types');
            const enabledTypes = [];
            
            if (response.data.review1Enabled) enabledTypes.push('review-1');
            if (response.data.review2Enabled) enabledTypes.push('review-2');
            
            setEnabledReviewTypes(enabledTypes);
            
            // Set default review type if only one is enabled
            if (enabledTypes.length === 1) {
                setFormData(prev => ({ ...prev, review_type: enabledTypes[0] }));
            }
        } catch (err) {
            console.error('Error fetching enabled review types:', err);
            setError('Failed to load challenge review options');
        }
    };
    
    fetchEnabledTypes();
}, []);

    const handleFetchDetails = async (e) => {
        e.preventDefault();
        if (!formData.team_id || !formData.student_reg_num || !formData.review_type) {
            setError('Team ID, Student Registration Number and Review Type are required');
            return;
        }

        try {
            setFetchingDetails(true);
            setError(null);
            
            // First check eligibility
            const eligibilityResponse = await axiosInstance.get(
                `/api/challenge-reviews/eligibility/${formData.student_reg_num}/${formData.semester}/${formData.review_type}`
            );
            
            if (!eligibilityResponse.data.isEligible) {
                throw new Error(eligibilityResponse.data.error || 'Not eligible for challenge review');
            }

            // Then fetch form data if eligible
            const response = await axiosInstance.get(
                `/api/challenge-reviews/form-data/${formData.team_id}`
            );
            
            setFormData(prev => ({
                ...prev,
                ...response.data.data
            }));
            setShowDetails(true);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch details');
        } finally {
            setFetchingDetails(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.request_reason) {
            setError('Reason for challenge review is required');
            return;
        }

        try {
            setLoading(true);
            await axiosInstance.post(
                `/api/challenge-reviews/submit/${formData.semester}/${formData.student_reg_num}/${formData.team_id}/${formData.review_type}`,
                { request_reason: formData.request_reason }
            );
            navigate('/student/Progress_update');
        } catch (err) {
            setError(err.response?.data?.message || 'Submission failed');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Don't render the form until we know which review types are enabled
    if (enabledReviewTypes.length === 0 && !error) {
        return (
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-6">Apply for Challenge Review</h2>
                <div className="text-center">Loading challenge review options...</div>
            </div>
        );
    }

    // If no review types are enabled (and we've finished loading)
    if (enabledReviewTypes.length === 0) {
        return (
            <div className="container mx-auto p-4">
                <h2 className="text-2xl font-bold mb-6">Apply for Challenge Review</h2>
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4">
                    <p className="text-yellow-700">Challenge reviews are currently disabled by admin for all review types.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <h2 className="text-2xl font-bold mb-6">Apply for Challenge Review</h2>
            
            {error && (
                <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}

            {!showDetails ? (
                // Initial form to collect basic info
                <form onSubmit={handleFetchDetails} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block mb-1">Semester *</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            >
                                <option value="">Select Semester</option>
                                <option value="5">Semester 5</option>
                                <option value="6">Semester 6</option>
                                <option value="7">Semester 7</option>
                                <option value="8">Semester 8</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Review Type *</label>
                            <select
                                name="review_type"
                                value={formData.review_type}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                                disabled={enabledReviewTypes.length === 1}
                            >
                                <option value="">Select Review Type</option>
                                {enabledReviewTypes.includes('review-1') && (
                                    <option value="review-1">First Review</option>
                                )}
                                {enabledReviewTypes.includes('review-2') && (
                                    <option value="review-2">Second Review</option>
                                )}
                            </select>
                            {enabledReviewTypes.length === 1 && (
                                <p className="text-sm text-gray-500 mt-1">
                                    Only {enabledReviewTypes[0] === 'review-1' ? 'First' : 'Second'} Review challenges are currently available
                                </p>
                            )}
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Team ID *</label>
                            <input
                                type="text"
                                name="team_id"
                                value={formData.team_id}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Student Registration Number *</label>
                            <input
                                type="text"
                                name="student_reg_num"
                                value={formData.student_reg_num}
                                onChange={handleChange}
                                required
                                className="w-full p-2 border rounded"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={fetchingDetails}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                    >
                        {fetchingDetails ? 'Fetching Details...' : 'Fetch Project Details'}
                    </button>
                </form>
            ) : (
                // Form to submit challenge review
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Auto-filled fields (readonly) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block mb-1">Project ID</label>
                            <input
                                type="text"
                                value={formData.project_id}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Project Type</label>
                            <input
                                type="text"
                                value={formData.project_type}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Cluster</label>
                            <input
                                type="text"
                                value={formData.cluster}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Guide Registration Number</label>
                            <input
                                type="text"
                                value={formData.guide_reg_num}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block mb-1">Sub-Expert Registration Number</label>
                            <input
                                type="text"
                                value={formData.sub_expert_reg_num}
                                readOnly
                                className="w-full p-2 border rounded bg-gray-100"
                            />
                        </div>
                    </div>

                    {/* Editable field */}
                    <div className="form-group">
                        <label className="block mb-1">Reason for Challenge Review *</label>
                        <textarea
                            name="request_reason"
                            value={formData.request_reason}
                            onChange={handleChange}
                            required
                            className="w-full p-2 border rounded"
                            rows="4"
                        />
                    </div>

                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => setShowDetails(false)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                        >
                            {loading ? 'Submitting...' : 'Submit Request'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ApplyChallengeReview;