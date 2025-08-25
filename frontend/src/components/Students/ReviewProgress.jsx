import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import ChallengeReviewButton from './challenge_review_button';

const ReviewProgress = () => {
  const { student_reg_num, team_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isOptionalReviewEligible, setIsOptionalReviewEligible] = useState(false);
  const [isChallengeReviewEligible, setIsChallengeReviewEligible] = useState(false);
  const [optionalReviewLoading, setOptionalReviewLoading] = useState(false);
  const [challengeReviewLoading, setChallengeReviewLoading] = useState(false);
  const [formData, setFormData] = useState({
    studentRegNum: student_reg_num || '',
    teamId: team_id || '',
    semester: '7',
    reviewType: 'review-1'
  });

  useEffect(() => {
    if (student_reg_num && team_id) {
      fetchReviewProgress(student_reg_num, team_id, '7', 'review-1');
    } else {
      setLoading(false);
    }
  }, [student_reg_num, team_id]);

  const fetchReviewProgress = async (regNum, teamId, semester, reviewType) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `http://localhost:5000/student/review-progress/${regNum}/${teamId}`, 
        { params: { semester, review_type: reviewType } }
      );
      
      if (response.data && response.data.status) {
        setReviewData(response.data.data);
        
        // Check eligibility for optional and challenge reviews if review is not completed
        if (response.data.data.overall_status !== 'Completed') {
          await checkOptionalReviewEligibility(regNum, semester, reviewType);
          await checkChallengeReviewEligibility(regNum, semester, reviewType);
        } else {
          setIsOptionalReviewEligible(false);
          setIsChallengeReviewEligible(false);
        }
      } else {
        setError(response.data?.message || 'No data found');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message ||
                           err.response?.data?.error ||
                           err.message ||
                           'Failed to fetch data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const checkOptionalReviewEligibility = async (regNum, semester, reviewType) => {
    setOptionalReviewLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/student/optional-review/eligibility/${regNum}`,
        { params: { 
          semester, 
          review_type: reviewType,
        team_id: teamp_id
       } }
      );
      setIsOptionalReviewEligible(response.data.isEligible || false);
    } catch (err) {
      console.error('Optional review eligibility check failed:', err);
      setIsOptionalReviewEligible(false);
    } finally {
      setOptionalReviewLoading(false);
    }
  };

  const checkChallengeReviewEligibility = async (regNum, semester, reviewType) => {
    setChallengeReviewLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/student/challenge-review/eligibility/${regNum}`,
        { params: { 
          semester, 
          review_type: reviewType,
          team_id: team_id
       } }
      );
      setIsChallengeReviewEligible(response.data.isEligible || false);
    } catch (err) {
      console.error('Challenge review eligibility check failed:', err);
      setIsChallengeReviewEligible(false);
    } finally {
      setChallengeReviewLoading(false);
    }
  };

  // Add this function to handle the case when a student has completed multiple reviews
  const getReviewPriorityInfo = () => {
    if (!reviewData) return null;
    
    const reviewTypes = {
      'regular': { priority: 1, name: 'Regular Review' },
      'optional': { priority: 2, name: 'Optional Review' },
      'challenge': { priority: 3, name: 'Challenge Review' }
    };
    
    // If review is completed, show which type was used
    if (reviewData.overall_status === 'Completed') {
      return {
        type: reviewData.review_mode,
        name: reviewTypes[reviewData.review_mode]?.name || 'Unknown Review Type',
        priority: reviewTypes[reviewData.review_mode]?.priority || 0
      };
    }
    
    return null;
  };
  
  const reviewPriorityInfo = getReviewPriorityInfo();


  const handleOptionalReviewClick = () => {
    navigate(`/student/optional-review/${reviewData.student_reg_num}/${reviewData.team_id}`, {
      state: {
        semester: formData.semester,
        reviewType: formData.reviewType
      }
    });
  };

  const handleChallengeReviewClick = () => {
    navigate(`/student/challenge-review/${reviewData.student_reg_num}/${reviewData.team_id}`, {
      state: {
        semester: formData.semester,
        reviewType: formData.reviewType
      }
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsOptionalReviewEligible(false);
    setIsChallengeReviewEligible(false);
    fetchReviewProgress(
      formData.studentRegNum, 
      formData.teamId, 
      formData.semester, 
      formData.reviewType
    );
  };

  const getStatusColor = (status) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getReviewTypeDisplay = (reviewType, marksSource) => {
    if (!marksSource) return reviewType === 'review-1' ? 'First Review' : 'Second Review';
    
    if (marksSource.includes('challenge')) {
      return reviewType === 'review-1' ? 'Challenge First Review' : 'Challenge Second Review';
    } else if (marksSource.includes('optional')) {
      return reviewType === 'review-1' ? 'Optional First Review' : 'Optional Second Review';
    }
    return reviewType === 'review-1' ? 'First Review' : 'Second Review';
  };

  const getReviewTypeColor = (reviewType, marksSource) => {
    if (!marksSource) {
      return reviewType === 'review-1' 
        ? 'bg-blue-100 text-blue-800' 
        : 'bg-purple-100 text-purple-800';
    }
    
    if (marksSource.includes('challenge')) {
      return 'bg-red-100 text-red-800';
    } else if (marksSource.includes('optional')) {
      return 'bg-orange-100 text-orange-800';
    }
    return reviewType === 'review-1' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  const getMarksSourceDisplay = (marksSource) => {
    if (!marksSource) return 'Not Available';
    
    if (marksSource.includes('challenge')) {
      return 'Challenge Review';
    } else if (marksSource.includes('optional')) {
      return 'Optional Review';
    }
    return 'Regular Review';
  };

  // Calculate the average marks based on the review mode
  const calculateAverageMarks = () => {
    if (!reviewData) return 'N/A';
    
    // If the review is completed, use the awarded_marks from the backend
    if (reviewData.overall_status === 'Completed') {
      return reviewData.awarded_marks ?? 'N/A';
    }
    
    return 'N/A';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {/* Add ChallengeReviewButton at the top right */}
      <div className="absolute top-4 right-4">
        <ChallengeReviewButton />
      </div>
      
      <h2 className="text-2xl font-bold mb-6">Review Progress</h2>
      
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
        <input
          type="text"
          name="studentRegNum"
          placeholder="Student Registration Number"
          value={formData.studentRegNum}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <input
          type="text"
          name="teamId"
          placeholder="Team ID"
          value={formData.teamId}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
        <select
          name="semester"
          value={formData.semester}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="5">Semester 5</option>
          <option value="6">Semester 6</option>
          <option value="7">Semester 7</option>
        </select>
        <select
          name="reviewType"
          value={formData.reviewType}
          onChange={handleChange}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="review-1">First Review</option>
          <option value="review-2">Second Review</option>
        </select>
        <button 
          type="submit"
          className="md:col-span-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{typeof error === 'object' ? JSON.stringify(error) : error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : reviewData ? (
        <div className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Team ID</p>
                <p className="mt-1 text-lg font-semibold">{reviewData.team_id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Student Reg No</p>
                <p className="mt-1 text-lg font-semibold">{reviewData.student_reg_num}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Semester</p>
                <p className="mt-1 text-lg font-semibold">Semester {reviewData.semester}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Review Type</p>
                <p className="mt-1">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReviewTypeColor(reviewData.review_type, reviewData.marks_source)}`}>
                    {getReviewTypeDisplay(reviewData.review_type, reviewData.marks_source)}
                  </span>
                </p>
              </div>
            </div>
            
             {reviewData && reviewPriorityInfo && (
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
          <p className="text-blue-700">
            <strong>Note:</strong> Your marks are from {reviewPriorityInfo.name} 
            {reviewPriorityInfo.priority > 1 && 
              ', which takes precedence over lower priority reviews'
            }.
          </p>
        </div>
      )}

            {/* Action Buttons - Only show if review is not completed */}
            {reviewData.overall_status !== 'Completed' && (
              <div className="mt-4 flex justify-end space-x-3">
                {/* Optional Review Button */}
                <button
                  onClick={handleOptionalReviewClick}
                  disabled={!isOptionalReviewEligible || optionalReviewLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    isOptionalReviewEligible 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-purple-500`}
                >
                  {optionalReviewLoading ? 'Checking...' : 'Apply Optional Review'}
                </button>
                
                {/* Challenge Review Button */}
                <button
                  onClick={handleChallengeReviewClick}
                  disabled={!isChallengeReviewEligible || challengeReviewLoading}
                  className={`px-4 py-2 rounded-md text-white ${
                    isChallengeReviewEligible 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none focus:ring-2 focus:ring-red-500`}
                >
                  {challengeReviewLoading ? 'Checking...' : 'Apply Challenge Review'}
                </button>
              </div>
            )}
          </div>

          {/* Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Guide Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Guide Evaluation</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reviewData.guide_status)}`}>
                  {reviewData.guide_status}
                </span>
              </div>
            </div>

            {/* Sub-Expert Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Sub-Expert Evaluation</h3>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reviewData.sub_expert_status)}`}>
                  {reviewData.sub_expert_status}
                </span>
              </div>
            </div>

            {/* Overall Status */}
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium mb-4">Overall Review</h3>
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">Status:</span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(reviewData.overall_status)}`}>
                  {reviewData.overall_status}
                </span>
              </div>
              {reviewData.overall_status === 'Completed' && (
                <>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Awarded Marks:</span>
                    <span className="text-xl font-bold">
                      {calculateAverageMarks()}
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-500">
                      Source: {getMarksSourceDisplay(reviewData.marks_source)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          {!error && "No data to display. Please search for a student's review progress."}
        </div>
      )}
    </div>
  );
};

export default ReviewProgress;