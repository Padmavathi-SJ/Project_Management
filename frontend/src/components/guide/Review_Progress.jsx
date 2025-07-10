import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

const ReviewProgress = () => {
  const guideRegNum = useSelector((state) => state.userSlice?.reg_num);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!guideRegNum) {
      setError('Guide registration number not found');
      setLoading(false);
      return;
    }

    const fetchReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await instance.get(`/guide/${guideRegNum}/schedules`);
        
        console.log('API Response:', response.data); // Debug log
        
        if (response.data.status && Array.isArray(response.data.schedules)) {
          setReviews(response.data.schedules);
        } else {
          throw new Error(response.data.error || 'Invalid response structure');
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
        setError(err.response?.data?.error || err.message || "Failed to load review schedules");
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [guideRegNum]);

  const formatDateTime = (dateString, timeString) => {
    try {
      if (!dateString || !timeString) return 'Not scheduled';
      
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid date';
      
      const [hours, minutes, seconds] = timeString.split(':').map(Number);
      date.setHours(hours, minutes, seconds || 0);
      
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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-solid"></div>
        <p className="mt-4 text-gray-600">Loading review schedules...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h3 className="text-red-700 font-medium">Error Loading Reviews</h3>
          <p className="text-red-600 mt-1">{error}</p>
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

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Review Schedules</h1>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            All Scheduled Reviews
          </h2>
          <span className="text-sm text-gray-500">
            {reviews.length} total reviews
          </span>
        </div>
        
        {reviews.length === 0 ? (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-blue-800">No review schedules found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border text-left">Team</th>
                  <th className="py-3 px-4 border text-left">Project</th>
                  <th className="py-3 px-4 border text-left">Type</th>
                  <th className="py-3 px-4 border text-left">Scheduled Time</th>
                  <th className="py-3 px-4 border text-left">Venue</th>
                  <th className="py-3 px-4 border text-left">Meeting</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50 even:bg-gray-50">
                    <td className="py-3 px-4 border font-medium">{review.team_id || 'N/A'}</td>
                    <td className="py-3 px-4 border">{review.project_id || 'N/A'}</td>
                    <td className="py-3 px-4 border">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                        {review.review_type || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-4 border">
                      {formatDateTime(review.date, review.time)}
                    </td>
                    <td className="py-3 px-4 border">{review.venue || 'Not specified'}</td>
                    <td className="py-3 px-4 border">
                      {review.meeting_link ? (
                        <a 
                          href={review.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:underline flex items-center"
                        >
                          <span>Join</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      ) : (
                        <span className="text-gray-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewProgress;