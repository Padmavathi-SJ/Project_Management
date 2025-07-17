import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const ReviewProgress = () => {
  const { student_reg_num, team_id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [isOptionalReviewEligible, setIsOptionalReviewEligible] = useState(false);
  const [optionalReviewLoading, setOptionalReviewLoading] = useState(false);
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
    if (!regNum || !teamId) {
      setError('Student Registration Number and Team ID are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(
        `http://localhost:5000/review-progress/${regNum}/${teamId}`, 
        {
          params: { 
            semester, 
            review_type: reviewType 
          }
        }
      );
      
      if (response.data.status) {
        setReviewData(response.data.data);
        // Check optional review eligibility
        checkOptionalReviewEligibility(regNum, semester, reviewType);
      } else {
        setError(response.data.error || 'No data found');
        setReviewData(null);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
      setReviewData(null);
    } finally {
      setLoading(false);
    }
  };

  const checkOptionalReviewEligibility = async (regNum, semester, reviewType) => {
    setOptionalReviewLoading(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/optional-reviews/eligibility/${regNum}`,
        {
          params: {
            semester,
            review_type: reviewType
          }
        }
      );
      setIsOptionalReviewEligible(response.data.isEligible);
    } catch (err) {
      console.error('Error checking optional review eligibility:', err);
      setIsOptionalReviewEligible(false);
    } finally {
      setOptionalReviewLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchReviewProgress(
      formData.studentRegNum, 
      formData.teamId, 
      formData.semester, 
      formData.reviewType
    );
  };

  const handleOptionalReviewClick = () => {
    if (reviewData && reviewData.student_reg_num && reviewData.team_id) {
      navigate(`/student/optional-review/${reviewData.student_reg_num}/${reviewData.team_id}`, {
        state: {
          semester: formData.semester,
          reviewType: formData.reviewType
        }
      });
    } else {
      console.error('Student registration number or team ID is missing');
    }
  };

  const getStatusColor = (status) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getReviewTypeColor = (type) => {
    return type === 'review-1' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-purple-100 text-purple-800';
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
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
          <option value="8">Semester 8</option>
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
          <p>{error}</p>
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
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReviewTypeColor(reviewData.review_type)}`}>
                    {reviewData.review_type === 'review-1' ? 'First Review' : 'Second Review'}
                  </span>
                </p>
              </div>
            </div>
            
            {/* Optional Review Button */}
            <div className="mt-4 flex justify-end">
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
            </div>
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
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Awarded Marks:</span>
                  <span className="text-xl font-bold">
                    {reviewData.awarded_marks ?? 'N/A'}
                  </span>
                </div>
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