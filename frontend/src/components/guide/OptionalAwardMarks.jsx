import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const AwardOptionalMarks = () => {
    const { reg_num, team_id } = useParams();
    const [formData, setFormData] = useState({
        semester: '',
        review_type: '',
        user_type: '',
        student_reg_num: '',
        marks: {}
    });
    const [studentsWithOptionalReviews, setStudentsWithOptionalReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Define evaluation parameters for optional reviews (same as normal reviews)
    const evaluationCriteria = {
        '5-6': {
            'review-1': {
                literature_review: { max: 5, label: 'Literature Review' },
                Aim_Objective_of_the_project: { max: 5, label: 'Aim & Objective' },
                Scope_of_the_project: { max: 5, label: 'Scope of Project' },
                Need_for_the_current_study: { max: 5, label: 'Need for Study' },
                Proposed_Methodology: { max: 10, label: 'Methodology' },
                Project_work_Plan: { max: 5, label: 'Work Plan' },
                Oral_Presentation: { max: 5, label: 'Presentation' },
                Viva_Voce_PPT: { max: 5, label: 'Viva Voce' },
                Contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions' }
            },
            'review-2': {
                designs: { max: 5, label: 'Designs' },
                novelty_of_the_project_partial_completion_of_report: { max: 5, label: 'Novelty' },
                analysis_of_results_and_discussions: { max: 10, label: 'Analysis' },
                originality_score_for_final_project_report: { max: 5, label: 'Originality' },
                oral_presentation: { max: 10, label: 'Presentation' },
                viva_voce_ppt: { max: 10, label: 'Viva Voce' },
                contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions' }
            }
        },
        '7': {
            'review-1': {
                literature_review: { max: 10, label: 'Literature Review' },
                aim_objective_of_the_project: { max: 5, label: 'Aim & Objective' },
                scope_of_the_project: { max: 5, label: 'Scope' },
                need_for_the_current_study: { max: 5, label: 'Need for Study' },
                feasibility_analysis: { max: 5, label: 'Feasibility' },
                proposed_methodology: { max: 20, label: 'Methodology' },
                choice_of_components_modules_equipment: { max: 10, label: 'Components' },
                designs_hardware_software_architecture: { max: 20, label: 'Designs' },
                novelty_of_the_project_partial_completion: { max: 15, label: 'Novelty' },
                oral_presentation: { max: 10, label: 'Presentation' },
                viva_voce: { max: 10, label: 'Viva Voce' },
                contribution_to_the_work_and_worklog: { max: 10, label: 'Contributions' }
            },
            'review-2': {
                project_work_plan: { max: 10, label: 'Work Plan' },
                effective_utilization_of_modern_tools: { max: 10, label: 'Tools Usage' },
                analysis_of_results_and_discussion: { max: 30, label: 'Analysis' },
                cost_benefit_analysis: { max: 5, label: 'Cost Benefit' },
                publications_conference_journal_patent: { max: 15, label: 'Publications' },
                originality_score_for_final_project_report: { max: 10, label: 'Originality' },
                oral_presentation: { max: 15, label: 'Presentation' },
                viva_voce: { max: 15, label: 'Viva Voce' },
                contributions_to_the_work_and_worklog: { max: 15, label: 'Contributions' }
            }
        }
    };

    // Fetch students who completed optional reviews
    useEffect(() => {
        const fetchStudentsWithOptionalReviews = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`/api/optional-reviews/team/${team_id}/eligible-students`);
                setStudentsWithOptionalReviews(response.data?.data || []);
            } catch (err) {
                console.error("Error:", err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load students with optional reviews');
            } finally {
                setLoading(false);
            }
        };
        fetchStudentsWithOptionalReviews();
    }, [team_id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
            // Reset marks when review type changes
            ...(name === 'review_type' || name === 'semester' ? { marks: {} } : {})
        }));
    };

    const handleMarkChange = (e) => {
        const { name, value } = e.target;
        const numericValue = value === '' ? null : parseInt(value);
        
        setFormData(prev => ({
            ...prev,
            marks: {
                ...prev.marks,
                [name]: numericValue
            }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload = {
                semester: formData.semester,
                review_type: formData.review_type,
                user_type: formData.user_type,
                student_reg_num: formData.student_reg_num,
                marks: formData.marks
            };

            const endpoint = formData.user_type === 'guide' 
                ? `/api/optional-review-marks/guide/${reg_num}/team/${team_id}/submit-optional-marks`
                : `/api/optional-review-marks/sub-expert/${reg_num}/team/${team_id}/submit-optional-marks`;

            const response = await axios.post(endpoint, payload);

            setSuccess('Optional review marks submitted successfully!');
            // Reset form
            setFormData({
                semester: '',
                review_type: '',
                user_type: '',
                student_reg_num: '',
                marks: {}
            });
        } catch (err) {
            const backendError = err.response?.data?.error || 
                              err.response?.data?.message || 
                              'Failed to submit optional review marks';
            const errorDetails = err.response?.data?.details || '';
            
            setError(`${backendError} ${errorDetails ? `(${errorDetails})` : ''}`);
            console.error('Submission error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const getCurrentCriteria = () => {
        if (!formData.semester || !formData.review_type) return null;
        const semesterKey = formData.semester === '5' || formData.semester === '6' ? '5-6' : '7';
        return evaluationCriteria[semesterKey]?.[formData.review_type] || null;
    };

    const currentCriteria = getCurrentCriteria();

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Award Optional Review Marks</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Submit marks for students who completed optional reviews after missing regular reviews
                </p>
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Semester */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                        <select
                            name="semester"
                            value={formData.semester}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Semester</option>
                            <option value="5">Semester 5</option>
                            <option value="6">Semester 6</option>
                            <option value="7">Semester 7</option>
                        </select>
                    </div>

                    {/* Review Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                        <select
                            name="review_type"
                            value={formData.review_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Review Type</option>
                            <option value="review-1">Review 1</option>
                            <option value="review-2">Review 2</option>
                        </select>
                    </div>

                    {/* User Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">You are submitting as</label>
                        <select
                            name="user_type"
                            value={formData.user_type}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Role</option>
                            <option value="guide">Guide</option>
                            <option value="sub_expert">Subject Expert</option>
                        </select>
                    </div>
                </div>

                {/* Student Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                    <select
                        name="student_reg_num"
                        value={formData.student_reg_num}
                        onChange={handleChange}
                        required
                        disabled={loading || studentsWithOptionalReviews.length === 0}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                        <option value="">Select Student</option>
                        {studentsWithOptionalReviews.length > 0 ? (
                            studentsWithOptionalReviews.map(student => (
                                <option key={student.student_reg_num} value={student.student_reg_num}>
                                    {student.student_reg_num} - {student.student_name}
                                </option>
                            ))
                        ) : (
                            <option disabled>
                                {loading ? 'Loading...' : 'No students with optional reviews available'}
                            </option>
                        )}
                    </select>
                </div>

                {/* Evaluation Parameters */}
                {currentCriteria && formData.student_reg_num && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(currentCriteria).map(([param, { max, label }]) => (
                                <div key={param} className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {label} (Max: {max})
                                    </label>
                                    <input
                                        type="number"
                                        name={param}
                                        min="0"
                                        max={max}
                                        value={formData.marks[param] ?? ''}
                                        onChange={handleMarkChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading || !formData.student_reg_num}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                            loading || !formData.student_reg_num ? 'opacity-70 cursor-not-allowed' : ''
                        }`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : 'Submit Optional Review Marks'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AwardOptionalMarks;