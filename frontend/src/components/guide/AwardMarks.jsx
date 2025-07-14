import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';

const AwardMarks = () => {
    const { reg_num, team_id } = useParams();
    const [formData, setFormData] = useState({
        semester: '',
        review_type: '',
        user_type: '',
        attendance: 'present',
        student_reg_num: '',
        marks: {}
    });
    const [teamMembers, setTeamMembers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Define all possible evaluation parameters with their max marks
    const evaluationCriteria = {
        '5-6': {
            'review-1': {
                literature_review: { max: 5, label: 'Literature Review' },
                Aim_Objective_of_the_project: { max: 5, label: 'Aim & Objective of the Project' },
                Scope_of_the_project: { max: 5, label: 'Scope of the Project' },
                Need_for_the_current_study: { max: 5, label: 'Need for the Current Study' },
                Proposed_Methodology: { max: 10, label: 'Proposed Methodology' },
                Project_work_Plan: { max: 5, label: 'Project Work Plan' },
                Oral_Presentation: { max: 5, label: 'Oral Presentation' },
                Viva_Voce_PPT: { max: 5, label: 'Viva Voce (PPT)' },
                Contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions & Worklog' }
            },
            'review-2': {
                designs: { max: 5, label: 'Designs' },
                novelty_of_the_project_partial_completion_of_report: { max: 5, label: 'Novelty & Partial Completion' },
                analysis_of_results_and_discussions: { max: 10, label: 'Analysis of Results & Discussions' },
                originality_score_for_final_project_report: { max: 5, label: 'Originality Score' },
                oral_presentation: { max: 10, label: 'Oral Presentation' },
                viva_voce_ppt: { max: 10, label: 'Viva Voce (PPT)' },
                contributions_to_the_work_and_worklog: { max: 5, label: 'Contributions & Worklog' }
            }
        },
        '7': {
            'review-1': {
                literature_review: { max: 10, label: 'Literature Review' },
                aim_objective_of_the_project: { max: 5, label: 'Aim & Objective' },
                scope_of_the_project: { max: 5, label: 'Scope of the Project' },
                need_for_the_current_study: { max: 5, label: 'Need for the Study' },
                feasibility_analysis: { max: 5, label: 'Feasibility Analysis' },
                proposed_methodology: { max: 20, label: 'Proposed Methodology' },
                choice_of_components_modules_equipment: { max: 10, label: 'Choice of Components' },
                designs_hardware_software_architecture: { max: 20, label: 'Designs & Architecture' },
                novelty_of_the_project_partial_completion: { max: 15, label: 'Novelty & Partial Completion' },
                oral_presentation: { max: 10, label: 'Oral Presentation' },
                viva_voce: { max: 10, label: 'Viva Voce' },
                contribution_to_the_work_and_worklog: { max: 10, label: 'Contributions & Worklog' }
            },
            'review-2': {
                project_work_plan: { max: 10, label: 'Project Work Plan' },
                effective_utilization_of_modern_tools: { max: 10, label: 'Utilization of Modern Tools' },
                analysis_of_results_and_discussion: { max: 30, label: 'Analysis of Results & Discussion' },
                cost_benefit_analysis: { max: 5, label: 'Cost Benefit Analysis' },
                publications_conference_journal_patent: { max: 15, label: 'Publications/Patents' },
                originality_score_for_final_project_report: { max: 10, label: 'Originality Score' },
                oral_presentation: { max: 15, label: 'Oral Presentation' },
                viva_voce: { max: 15, label: 'Viva Voce' },
                contributions_to_the_work_and_worklog: { max: 15, label: 'Contributions & Worklog' }
            }
        }
    };

    // Fetch team members when component mounts // Fetch team members when component mounts
useEffect(() => {
        const fetchTeamMembers = async () => {
            try {
                setLoading(true);
                setError('');
                const response = await axios.get(`/api/marks/team/${team_id}/members`);
                setTeamMembers(response.data?.data || []);
            } catch (err) {
                console.error("Error:", err.response?.data || err.message);
                setError(err.response?.data?.message || 'Failed to load team members');
            } finally {
                setLoading(false);
            }
        };
        fetchTeamMembers();
    }, [team_id]);


const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

const handleMarkChange = (e) => {
    const { name, value } = e.target;
    // Convert empty string to null for database
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
            // Prepare the payload exactly as backend expects
            const payload = {
                semester: formData.semester,
                review_type: formData.review_type,
                user_type: formData.user_type,
                attendance: formData.attendance,
                student_reg_num: formData.student_reg_num,
                marks: formData.marks
            };

            console.log('Submitting payload:', payload); // For debugging

            const endpoint = formData.user_type === 'guide' 
                ? `/api/marks/guide/${reg_num}/team/${team_id}/submit-marks`
                : `/api/marks/sub-expert/${reg_num}/team/${team_id}/submit-marks`;

            const response = await axios.post(endpoint, payload);

            setSuccess('Marks submitted successfully!');
            // Reset only the mutable fields
            setFormData(prev => ({
                ...prev,
                student_reg_num: '',
                marks: {},
                attendance: 'present'
            }));
        } catch (err) {
            const backendError = err.response?.data?.error || 
                              err.response?.data?.message || 
                              'Failed to submit marks';
            const errorDetails = err.response?.data?.details || '';
            
            setError(`${backendError} ${errorDetails ? `(${errorDetails})` : ''}`);
            console.error('Submission error:', err.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    // Get current evaluation criteria based on semester and review type
    const getCurrentCriteria = () => {
        if (!formData.semester || !formData.review_type) return null;
        
        const semesterKey = formData.semester === '5' || formData.semester === '6' ? '5-6' : '7';
        return evaluationCriteria[semesterKey]?.[formData.review_type] || null;
    };

    const currentCriteria = getCurrentCriteria();

 return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
            <div className="border-b pb-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Award Marks</h2>
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Student */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Student</label>
                        <select
                            name="student_reg_num"
                            value={formData.student_reg_num}
                            onChange={handleChange}
                            required
                            disabled={loading || !Array.isArray(teamMembers) || teamMembers.length === 0}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100 disabled:text-gray-500"
                        >
                            <option value="">Select Student</option>
                            {Array.isArray(teamMembers) && teamMembers.length > 0 ? (
                                teamMembers.map(member => (
                                    <option key={member.student_reg_num} value={member.student_reg_num}>
                                        {member.student_reg_num}
                                    </option>
                                ))
                            ) : (
                                <option disabled>
                                    {loading ? 'Loading...' : 'No team members available'}
                                </option>
                            )}
                        </select>
                    </div>

                    {/* Attendance */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Attendance</label>
                        <select
                            name="attendance"
                            value={formData.attendance}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                        </select>
                    </div>
                </div>

               {formData.attendance === 'present' && currentCriteria && (
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
                                    required={formData.attendance === 'present'}
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
                        disabled={loading}
                        className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Submitting...
                            </>
                        ) : 'Submit Marks'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default AwardMarks;