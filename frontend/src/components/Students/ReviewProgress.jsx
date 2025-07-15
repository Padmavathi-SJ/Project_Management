import React, { useState } from 'react';
import axios from 'axios';

const ReviewProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [reviewData, setReviewData] = useState([]);
  const [formData, setFormData] = useState({
    studentRegNum: '',
    teamId: '',
    semester: '7',
    reviewType: 'review-1'
  });

  const fetchReviewProgress = async () => {
    const { studentRegNum, teamId, semester, reviewType } = formData;
    
    if (!studentRegNum || !teamId) {
      setError('Student Registration Number and Team ID are required');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.get(`/review-progress/${studentRegNum}/${teamId}`, {
        params: { semester, review_type: reviewType }
      });
      
      if (response.data.status) {
        setReviewData([response.data.data]);
      } else {
        setError(response.data.error || 'No data found');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to fetch data');
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
    fetchReviewProgress();
  };

  const getStatusColor = (status) => {
    return status === 'Completed' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-yellow-100 text-yellow-800';
  };

  const getReviewTypeColor = (type) => {
    return type === 'review-1' 
      ? 'bg-blue-100 text-blue-800' 
      : 'bg-green-100 text-green-800';
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
      ) : (
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
            <tbody className="divide-y divide-gray-200">
              {reviewData.map((item) => (
                <tr key={`${item.team_id}-${item.student_reg_num}-${item.review_type}`}>
                  <td className="px-6 py-4 whitespace-nowrap border-b">{item.team_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">{item.student_reg_num}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">Semester {item.semester}</td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getReviewTypeColor(item.review_type)}`}>
                      {item.review_type === 'review-1' ? 'First Review' : 'Second Review'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap border-b font-medium">
                    {item.awarded_marks ?? 'Not Available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReviewProgress;