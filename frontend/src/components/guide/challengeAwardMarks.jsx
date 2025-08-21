import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const AwardChallengeMarks = () => {
    const { reg_num, team_id } = useParams();
    const location = useLocation();
    const { reviewData } = location.state || {};
    
    const [formData, setFormData] = useState({
        semester: reviewData?.semester || '',
        review_type: reviewData?.review_type || '',
        user_type: reviewData?.user_role === 'pmc1' || reviewData?.user_role === 'pmc2' ? reviewData.user_role : 'pmc1',
        student_reg_num: reviewData?.student_reg_num || '',
        attendance: 'present',
        // Marks fields - will be dynamically populated based on semester and review type
    });

    const [eligibleStudents, setEligibleStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [marksFields, setMarksFields] = useState({});

    // Define evaluation parameters for challenge reviews based on your database schema
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
                novelty_of_the_project_partial_completion_of_report: { max: 5, label: 'Novelty & Partial Completion' },
                analysis_of_results_and_discussions: { max: 5, label: 'Analysis & Discussion' },
                originality_score_for_final_project_report: { max: 5, label: 'Originality Score' },
                oral_presentation: { max: 5, label: 'Presentation' },
                viva_voce_ppt: { max: 5, label: 'Viva Voce' },
                contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions' }
            }
        },
        '7': {
            'review-1': {
                literature_review: { max: 10, label: 'Literature Review' },
                aim_objective_of_the_project: { max: 5, label: 'Aim & Objective' },
                scope_of_the_project: { max: 5, label: 'Scope' },
                need_for_the_current_study: { max: 5, label: 'Need for Study' },
                feasibility_analysis: { max: 5, label: 'Feasibility Analysis' },
                proposed_methodology: { max: 10, label: 'Methodology' },
                choice_of_components_modules_equipment: { max: 5, label: 'Component Choice' },
                designs_hardware_software_architecture: { max: 5, label: 'Design Architecture' },
                novelty_of_the_project_partial_completion: { max: 5, label: 'Novelty & Partial Completion' },
                oral_presentation: { max: 5, label: 'Presentation' },
                viva_voce: { max: 5, label: 'Viva Voce' },
                contribution_to_the_work_and_worklog: { max: 5, label: 'Contributions' }
            },
            'review-2': {
                project_work_plan: { max: 5, label: 'Work Plan' },
                effective_utilization_of_modern_tools: { max: 5, label: 'Modern Tools Utilization' },
                analysis_of_results_and_discussion: { max: 10, label: 'Analysis & Discussion' },
                cost_benefit_analysis: { max: 5, label: 'Cost-Benefit Analysis' },
                publications_conference_journal_patent: { max: 5, label: 'Publications/Patents', isText: true },
                originality_score_for_final_project_report: { max: 5, label: 'Originality Score' },
                oral_presentation: { max: 5, label: 'Presentation' },
                viva_voce: { max: 5, label: 'Viva Voce' },
                contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions' }
            }
        }
    };

    // Fetch eligible students
    useEffect(() => {
        if (reviewData?.student_reg_num) {
            setFormData(prev => ({
                ...prev,
                student_reg_num: reviewData.student_reg_num,
                semester: reviewData.semester,
                review_type: reviewData.review_type,
                user_type: reviewData.user_role
            }));
        }

     // Inside the fetchData function
const fetchData = async () => {
    try {
        setLoading(true);
        setError('');
        console.log("Fetching eligible students for team:", team_id);
        const response = await axios.get(`/api/challenge-reviews/team/${team_id}/eligible-challenge-students`);
        console.log("Fetched students:", response.data?.data);
        setEligibleStudents(response.data?.data || []);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to load data');
    } finally {
        setLoading(false);
    }
};
        
        fetchData();
    }, [team_id, reviewData]);

    // Update marks fields when semester or review type changes
    useEffect(() => {
        if (formData.semester && formData.review_type) {
            const semesterKey = formData.semester === '5' || formData.semester === '6' ? '5-6' : '7';
            const criteria = evaluationCriteria[semesterKey]?.[formData.review_type] || {};
            
            setMarksFields(criteria);
            
            // Initialize form data for the new criteria
            const newFormData = { ...formData };
            Object.keys(criteria).forEach(field => {
                if (newFormData[field] === undefined) {
                    newFormData[field] = '';
                }
            });
            
            // Remove fields that are not in the current criteria
            Object.keys(newFormData).forEach(field => {
                if (!['semester', 'review_type', 'user_type', 'student_reg_num', 'attendance'].includes(field) && 
                    !criteria[field]) {
                    delete newFormData[field];
                }
            });
            
            setFormData(newFormData);
        }
    }, [formData.semester, formData.review_type]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleMarkChange = (e) => {
        const { name, value } = e.target;
        const fieldConfig = marksFields[name];
        
        let processedValue;
        if (fieldConfig?.isText) {
            processedValue = value;
        } else {
            processedValue = value === '' ? '' : Math.min(parseInt(value) || 0, fieldConfig?.max || 100);
        }
        
        setFormData(prev => ({
            ...prev,
            [name]: processedValue
        }));
    };

    const handleAttendanceChange = (e) => {
        const { value } = e.target;
        const newFormData = {
            ...formData,
            attendance: value
        };
        
        // Clear marks if attendance is set to absent
        if (value === 'absent') {
            Object.keys(marksFields).forEach(field => {
                newFormData[field] = '';
            });
        }
        
        setFormData(newFormData);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            // Prepare payload according to backend expectations
            const payload = {
                user_type: formData.user_type,
                semester: formData.semester,
                review_type: formData.review_type,
                student_reg_num: formData.student_reg_num,
                attendance: formData.attendance
            };

            // Add role-specific field
            if (formData.user_type === 'pmc1') {
                payload.guide_reg_num = reg_num;
            } else if (formData.user_type === 'pmc2') {
                payload.sub_expert_reg_num = reg_num;
            }

            // Add marks only if student is present
            if (formData.attendance === 'present') {
                const marks = {};
                Object.keys(marksFields).forEach(key => {
                    if (formData[key] !== '' && formData[key] !== undefined) {
                        marks[key] = formData[key];
                    }
                });
                payload.marks = marks;
            }

            const endpoint = `/api/challenge-reviews/${formData.user_type}/${reg_num}/team/${team_id}/submit-challenge-marks`;

            const response = await axios.post(endpoint, payload);

            setSuccess('Challenge review marks submitted successfully!');
            
            // Reset form but keep basic info
            const resetFormData = {
                semester: formData.semester,
                review_type: formData.review_type,
                user_type: formData.user_type,
                student_reg_num: '',
                attendance: 'present'
            };
            
            Object.keys(marksFields).forEach(field => {
                resetFormData[field] = '';
            });
            
            setFormData(resetFormData);
        } catch (err) {
            const backendError = err.response?.data?.error || 
                              err.response?.data?.message || 
                              'Failed to submit challenge review marks';
            const missingFields = err.response?.data?.missing_fields || [];
            
            setError(`${backendError} ${missingFields.length > 0 ? `(Missing: ${missingFields.join(', ')})` : ''}`);
            console.error('Submission error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const calculateTotalMarks = () => {
        if (formData.attendance === 'absent') return 0;
        
        let total = 0;
        Object.entries(marksFields).forEach(([field, config]) => {
            if (formData[field] && !isNaN(formData[field]) && !config.isText) {
                total += parseInt(formData[field]);
            }
        });
        return total;
    };

    return (
        <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Award Challenge Review Marks</h2>
                <p className="text-sm text-gray-600 mt-1">
                    Submit marks for students who have completed challenge reviews
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
                            <option value="review-1">First Review</option>
                            <option value="review-2">Second Review</option>
                        </select>
                    </div>

                    {/* User Type (hidden if coming from reviewData) */}
                    {!reviewData?.user_role && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">You are submitting as</label>
                            <select
                                name="user_type"
                                value={formData.user_type}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="pmc1">PMC1 (Guide)</option>
                                <option value="pmc2">PMC2 (Subject Expert)</option>
                            </select>
                        </div>
                    )}
                </div>

                {/* Student Selection */}
{/* Student Selection */}
<div>
    <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
    <select
        name="student_reg_num"
        value={formData.student_reg_num}
        onChange={handleChange}
        required
        disabled={loading || eligibleStudents.length === 0}
        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
    >
        <option value="">Select Student</option>
        {eligibleStudents.length > 0 ? (
            eligibleStudents.map(student => (
                <option key={student.reg_num || student.student_reg_num} 
                        value={student.reg_num || student.student_reg_num}>
                    {student.reg_num || student.student_reg_num} - {student.name || 'Student'}
                </option>
            ))
        ) : (
            <option disabled>
                {loading ? 'Loading students...' : 'No eligible students found'}
            </option>
        )}
    </select>
</div>

{/* Attendance - Always visible */}
<div className="mt-4">
    <label className="block text-sm font-medium text-gray-700 mb-2">Attendance Status</label>
    <div className="flex space-x-6">
        <label className="inline-flex items-center">
            <input
                type="radio"
                name="attendance"
                value="present"
                checked={formData.attendance === 'present'}
                onChange={handleAttendanceChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-gray-700">Present</span>
        </label>
        <label className="inline-flex items-center">
            <input
                type="radio"
                name="attendance"
                value="absent"
                checked={formData.attendance === 'absent'}
                onChange={handleAttendanceChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
            />
            <span className="ml-2 text-gray-700">Absent</span>
        </label>
    </div>
    <p className="text-sm text-gray-500 mt-1">
        Select "Absent" if the student did not attend the review
    </p>
</div>

                {/* Evaluation Parameters (only shown if present) */}
                {formData.attendance === 'present' && Object.keys(marksFields).length > 0 && formData.student_reg_num && (
                    <div className="mt-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Evaluation Parameters</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {Object.entries(marksFields).map(([param, { max, label, isText }]) => (
                                <div key={param} className="space-y-1">
                                    <label className="block text-sm font-medium text-gray-700">
                                        {label} {!isText && `(Max: ${max})`}
                                    </label>
                                    {isText ? (
                                        <input
                                            type="text"
                                            name={param}
                                            value={formData[param] || ''}
                                            onChange={handleMarkChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                            placeholder="Enter details"
                                        />
                                    ) : (
                                        <input
                                            type="number"
                                            name={param}
                                            min="0"
                                            max={max}
                                            value={formData[param] || ''}
                                            onChange={handleMarkChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                        
                        {/* Total Marks Display */}
                        <div className="mt-4 p-3 bg-gray-50 rounded-md">
                            <p className="text-sm font-medium text-gray-700">
                                Total Marks: <span className="text-lg font-bold">{calculateTotalMarks()}</span>
                            </p>
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
                        ) : 'Submit Challenge Review Marks'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AwardChallengeMarks;