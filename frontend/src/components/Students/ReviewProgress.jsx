import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const ReviewProgress = () => {
  const { student_reg_num, team_id } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState(null);
  const [formData, setFormData] = useState({
    studentRegNum: student_reg_num || '',
    teamId: team_id || '',
    semester: '7',
    reviewType: 'review-1'
  });

  // Fetch logged-in student's data on component mount
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
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Team ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Student Reg No</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Semester</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Review Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">Awarded Marks</th>
              </tr>
            </thead>
            <tbody>
              <tr key={`${reviewData.team_id}-${reviewData.student_reg_num}-${reviewData.review_type}`}>
                <td className="px-6 py-4 whitespace-nowrap border-b">{reviewData.team_id}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">{reviewData.student_reg_num}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">Semester {reviewData.semester}</td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReviewTypeColor(reviewData.review_type)}`}>
                    {reviewData.review_type === 'review-1' ? 'First Review' : 'Second Review'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(reviewData.status)}`}>
                    {reviewData.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b font-medium">
                  {reviewData.awarded_marks ?? 'Not Available'}
                </td>
              </tr>
            </tbody>
          </table>
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