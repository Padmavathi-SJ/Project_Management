import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import instance from '../../utils/axiosInstance';

const OptionalReviewProgress = () => {
  const userRegNum = useSelector((state) => state.userSlice?.reg_num);
  const [activeTab, setActiveTab] = useState('guide');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRegNum) {
      setError('Registration number not found');
      setLoading(false);
      return;
    }

    const fetchOptionalReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await instance.get(`/api/optional-reviews/get_scheduled_reviews/${userRegNum}`);
        console.log('Optional reviews response:', response.data);

        if (response.data.status) {
          setReviews(response.data.data || []);
        } else {
          setError(response.data.error || "No optional reviews found");
        }
      } catch (err) {
        console.error("Error fetching optional reviews:", err);
        setError(err.response?.data?.error || err.message || "Failed to load optional review schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchOptionalReviews();
  }, [userRegNum]);

  const handleStatusChange = async (reviewId, newStatus) => {
    try {
      setUpdatingStatus(true);
      
      const endpoint = `/api/optional-reviews/guide/${reviewId}/status/${userRegNum}`;
      await instance.patch(endpoint, { status: newStatus });
      
      setReviews(prev => prev.map(review => 
        review.review_id === reviewId ? { ...review, status: newStatus } : review
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.error || err.message || "Failed to update status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleAwardMarks = (review) => {
    navigate(`/optional-reviews/award-marks/${review.review_id}`, {
      state: { 
        teamId: review.team_id,
        projectId: review.project_id,
        reviewType: review.review_type,
        semester: review.semester 
      }
    });
  };

  const formatDateTime = (scheduledTime) => {
    try {
      if (!scheduledTime) return 'Not scheduled';
      const date = new Date(scheduledTime);
      if (isNaN(date.getTime())) return 'Invalid date';
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date/time';
    }
  };

  const renderTable = (filteredReviews) => {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-3 px-4 border text-left">Team</th>
              <th className="py-3 px-4 border text-left">Semester</th>
              <th className="py-3 px-4 border text-left">Project</th>
              <th className="py-3 px-4 border text-left">Type</th>
              <th className="py-3 px-4 border text-left">Scheduled Time</th>
              <th className="py-3 px-4 border text-left">Venue</th>
              <th className="py-3 px-4 border text-left">Status</th>
              <th className="py-3 px-4 border text-left">Meeting</th>
              <th className="py-3 px-4 border text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredReviews.map((review) => (
              <tr key={review.review_id} className="hover:bg-gray-50 even:bg-gray-50">
                <td className="py-3 px-4 border font-medium">{review.team_id || 'N/A'}</td>
                <td className="py-3 px-4 border font-medium">{review.semester || 'N/A'}</td>
                <td className="py-3 px-4 border">{review.project_id || 'N/A'}</td>
                <td className="py-3 px-4 border">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                    {review.review_type || 'Optional'}
                  </span>
                </td>
                <td className="py-3 px-4 border">
                  {formatDateTime(review.scheduled_time)}
                </td>
                <td className="py-3 px-4 border">{review.venue || 'Not specified'}</td>
                <td className="py-3 px-4 border">
                  <select
                    value={review.status}
                    onChange={(e) => handleStatusChange(review.review_id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                    disabled={updatingStatus}
                  >
                    <option value="Not completed">Not completed</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                  </select>
                </td>
                <td className="py-3 px-4 border">
                  {review.meeting_link ? (
                    <a href={review.meeting_link} target="_blank" rel="noopener noreferrer"
                      className="text-purple-600 hover:underline flex items-center">
                      <span>Join</span>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-gray-400">None</span>
                  )}
                </td>
                <td className="py-3 px-4 border">
                  {review.status === 'Completed' && (
                    <button
                      onClick={() => handleAwardMarks(review)}
                      className="px-3 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200 text-sm"
                    >
                      Award Marks
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-solid"></div>
        <p className="mt-4 text-gray-600">Loading optional review schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h3 className="text-red-700 font-medium">Error Loading Optional Reviews</h3>
          <p className="text-red-600 mt-1">{typeof error === 'string' ? error : JSON.stringify(error)}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Filter reviews based on active tab
  const filteredReviews = reviews.filter(review => 
    activeTab === 'guide' 
      ? review.user_role === 'guide' 
      : review.user_role === 'sub_expert'
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Optional Review Schedules</h1>
      
      <div className="flex border-b mb-4">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'guide' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-500 hover:text-purple-600'}`}
          onClick={() => setActiveTab('guide')}
        >
          Guide Reviews
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'subExpert' ? 'text-purple-700 border-b-2 border-purple-700' : 'text-gray-500 hover:text-purple-600'}`}
          onClick={() => setActiveTab('subExpert')}
        >
          Sub-Expert Reviews
        </button>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {activeTab === 'guide' ? 'Guide Optional Reviews' : 'Sub-Expert Optional Reviews'}
          </h2>
          <span className="text-sm text-gray-500">
            {filteredReviews.length} reviews found
          </span>
        </div>
        
        {filteredReviews.length === 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800">
              No {activeTab === 'guide' ? 'guide' : 'sub-expert'} optional reviews found.
            </p>
          </div>
        ) : (
          renderTable(filteredReviews)
        )}
      </div>
    </div>
  );
};

export default OptionalReviewProgress;