import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import NotificationPopup from './NotificationPopup';

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
    const [loading, setLoading] = useState({
        semester: false,
        details: false,
        submission: false
    });
    const [error, setError] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [enabledReviewTypes, setEnabledReviewTypes] = useState([]);
    const [notification, setNotification] = useState(null);

    // Fetch enabled review types on component mount
    useEffect(() => {
        const fetchEnabledTypes = async () => {
            try {
                const response = await axiosInstance.get('/api/challenge-reviews/enabled-review-types');
                const types = [];
                
                if (response.data.review1Enabled) types.push('review-1');
                if (response.data.review2Enabled) types.push('review-2');
                
                setEnabledReviewTypes(types);
                
                if (types.length === 1) {
                    setFormData(prev => ({ ...prev, review_type: types[0] }));
                }
            } catch (err) {
                console.error('Error fetching enabled review types:', err);
                setError('Failed to load challenge review options. Please try again later.');
            }
        };
        
        fetchEnabledTypes();
    }, []);

    // Fetch semester when student registration number changes
    useEffect(() => {
        const fetchSemester = async () => {
            if (!formData.student_reg_num) return;
            
            try {
                setLoading(prev => ({ ...prev, semester: true }));
                setError(null);
                
                const response = await axiosInstance.get(
                    `/api/challenge-reviews/semester/${formData.student_reg_num}`
                );
                
                if (response.data.success) {
                    setFormData(prev => ({
                        ...prev,
                        semester: response.data.semester.toString()
                    }));
                } else {
                    setError('Failed to fetch semester information. Please enter it manually.');
                }
            } catch (err) {
                console.error('Error fetching semester:', err);
                setError('Failed to fetch semester. Please enter it manually.');
            } finally {
                setLoading(prev => ({ ...prev, semester: false }));
            }
        };
        
        const timer = setTimeout(() => {
            if (formData.student_reg_num && formData.student_reg_num.length >= 6) {
                fetchSemester();
            }
        }, 500);
        
        return () => clearTimeout(timer);
    }, [formData.student_reg_num]);

    const handleFetchDetails = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!formData.team_id || !formData.student_reg_num || !formData.review_type || !formData.semester) {
            setError('All fields are required to fetch details');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, details: true }));
            setError(null);
            
            // Check eligibility
            const eligibilityResponse = await axiosInstance.get(
                `/api/challenge-reviews/eligibility/${formData.student_reg_num}/${formData.semester}/${formData.review_type}`
            );
            
            if (!eligibilityResponse.data.isEligible) {
                throw new Error(eligibilityResponse.data.error || 'You are not eligible for a challenge review');
            }

            // Fetch form data
            const response = await axiosInstance.get(
                `/api/challenge-reviews/form-data/${formData.team_id}`
            );
            
            if (!response.data.success) {
                throw new Error('Failed to fetch project details');
            }
            
            setFormData(prev => ({
                ...prev,
                ...response.data.data
            }));
            setShowDetails(true);
        } catch (err) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch details. Please verify your information.');
        } finally {
            setLoading(prev => ({ ...prev, details: false }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.request_reason || formData.request_reason.trim().length < 10) {
            setError('Please provide a detailed reason for your challenge review (minimum 10 characters)');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, submission: true }));
            setError(null);
            
            await axiosInstance.post(
                `/api/challenge-reviews/submit/${formData.semester}/${formData.student_reg_num}/${formData.team_id}/${formData.review_type}`,
                { request_reason: formData.request_reason.trim() }
            );
            
            // Show success notification
            setNotification({
                message: 'Challenge review request submitted successfully!',
                type: 'success'
            });

             // Reset form after submission
            setTimeout(() => {
                setFormData({
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
                setShowDetails(false);
                navigate('/student/Progress_update');
            }, 2000);
        } catch (err) {
            console.error('Submission error:', err);
            setError(err.response?.data?.message || 'Submission failed. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, submission: false }));
        }

    };

      const closeNotification = () => {
        setNotification(null);
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
                <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 rounded">
                    <p className="text-yellow-700">Challenge reviews are currently disabled by admin for all review types.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 max-w-4xl">
            <h2 className="text-2xl font-bold mb-6">Apply for Challenge Review</h2>
            
             {/* Notification Popup */}
            {notification && (
                <NotificationPopup 
                    message={notification.message}
                    type={notification.type}
                    onClose={closeNotification}
                />
            )}

            {error && !notification && (
                <div className="mb-4 p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
                    {error}
                </div>
            )}

            {!showDetails ? (
                // Initial form to collect basic info
                <form onSubmit={handleFetchDetails} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="form-group">
                            <label className="block mb-2 font-medium">Student Registration Number *</label>
                            <input
                                type="text"
                                name="student_reg_num"
                                value={formData.student_reg_num}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your registration number"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="block mb-2 font-medium">Semester *</label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={loading.semester}
                            >
                                <option value="">Select Semester</option>
                                <option value="5">Semester 5</option>
                                <option value="6">Semester 6</option>
                                <option value="7">Semester 7</option>
                                <option value="8">Semester 8</option>
                            </select>
                            {loading.semester && (
                                <p className="text-sm text-gray-500 mt-1">Fetching semester...</p>
                            )}
                        </div>
                        
                        <div className="form-group">
                            <label className="block mb-2 font-medium">Team ID *</label>
                            <input
                                type="text"
                                name="team_id"
                                value={formData.team_id}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                placeholder="Enter your team ID"
                            />
                        </div>
                        
                        <div className="form-group">
                            <label className="block mb-2 font-medium">Review Type *</label>
                            <select
                                name="review_type"
                                value={formData.review_type}
                                onChange={handleChange}
                                required
                                className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={loading.details}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading.details ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Fetching Details...
                                </span>
                            ) : 'Fetch Project Details'}
                        </button>
                    </div>
                </form>
            ) : (
                // Form to submit challenge review
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Project Details</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Project ID', value: formData.project_id },
                                { label: 'Project Type', value: formData.project_type },
                                { label: 'Cluster', value: formData.cluster },
                                { label: 'Guide Registration Number', value: formData.guide_reg_num },
                                { label: 'Sub-Expert Registration Number', value: formData.sub_expert_reg_num },
                                { label: 'Semester', value: `Semester ${formData.semester}` },
                                { label: 'Review Type', value: formData.review_type === 'review-1' ? 'First Review' : 'Second Review' }
                            ].map((item, index) => (
                                <div key={index} className="form-group">
                                    <label className="block mb-1 text-sm font-medium text-gray-500">{item.label}</label>
                                    <div className="p-2 bg-white border rounded text-gray-800">
                                        {item.value || 'N/A'}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block mb-2 font-medium">Reason for Challenge Review *</label>
                        <textarea
                            name="request_reason"
                            value={formData.request_reason}
                            onChange={handleChange}
                            required
                            minLength="10"
                            className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="5"
                            placeholder="Please provide a detailed explanation for why you're requesting a challenge review..."
                        />
                        <p className="text-sm text-gray-500 mt-1">Minimum 10 characters required</p>
                    </div>

                    <div className="flex justify-between">
                        <button
                            type="button"
                            onClick={() => setShowDetails(false)}
                            className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading.submission}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            {loading.submission ? (
                                <span className="flex items-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Submitting...
                                </span>
                            ) : 'Submit Request'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default ApplyChallengeReview;