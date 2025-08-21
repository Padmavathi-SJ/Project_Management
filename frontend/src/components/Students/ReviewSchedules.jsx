import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

const ReviewSchedules = () => {
  const teamSelector = useSelector((state) => state.teamSlice);
  const [reviews, setReviews] = useState([]);
  const [upcomingReviews, setUpcomingReviews] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teamSelector && teamSelector[0]?.team_id) {
      fetchReviews();
      fetchUpcomingReviews();
    }
  }, [teamSelector]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await instance.get(`/student/reviews/regular/${teamSelector[0].team_id}`);
      setReviews(response.data.data || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load review schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingReviews = async () => {
    try {
      const response = await instance.get(`/reviews/regular/upcoming/${teamSelector[0].team_id}`);
      setUpcomingReviews(response.data.data || []);
    } catch (err) {
      console.error("Error fetching upcoming reviews:", err);
    }
  };

  const formatDateTime = (dateString, startTime, endTime) => {
    const date = new Date(dateString);
    const start = startTime.split(':');
    const end = endTime.split(':');
    
    const startDate = new Date(date);
    startDate.setHours(start[0], start[1], start[2]);
    
    const endDate = new Date(date);
    endDate.setHours(end[0], end[1], end[2]);
    
    return `${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - ${endDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'Completed': 'bg-green-100 text-green-800',
      'Not completed': 'bg-yellow-100 text-yellow-800',
      'Rescheduled': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const getReviewTypeBadge = (reviewType) => {
    return (
      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
        {reviewType}
      </span>
    );
  };

  const getModeBadge = (reviewMode) => {
    const modeConfig = {
      'online': 'bg-blue-100 text-blue-800',
      'offline': 'bg-orange-100 text-orange-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${modeConfig[reviewMode] || 'bg-gray-100 text-gray-800'}`}>
        {reviewMode}
      </span>
    );
  };

  const filteredReviews = activeTab === 'upcoming' ? upcomingReviews : reviews;

  if (!teamSelector || teamSelector.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-3xl flex justify-center font-bold text-black">Review Schedules</h1>
        <p className="flex justify-center mt-2 text-lg text-gray-600">
          Team ID: <span className="font-semibold ml-1">{teamSelector[0].team_id}</span>
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="flex border-b mb-6">
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('all')}
        >
          All Reviews ({reviews.length})
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'upcoming' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming Reviews ({upcomingReviews.length})
        </button>
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-blue-500 border-solid"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Reviews Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4 text-black">
          {activeTab === 'upcoming' ? 'Upcoming Review Schedules' : 'All Review Schedules'}
        </h2>
        <hr className="mb-4" />
        
        {filteredReviews.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {activeTab === 'upcoming' 
              ? 'No upcoming reviews scheduled for this team.' 
              : 'No reviews scheduled for this team.'
            }
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-3 px-4 border text-left">Review Type</th>
                  <th className="py-3 px-4 border text-left">Date & Time</th>
                  <th className="py-3 px-4 border text-left">Mode</th>
                  <th className="py-3 px-4 border text-left">Venue/Link</th>
                  <th className="py-3 px-4 border text-left">Guide Review Status</th>
                  <th className="py-3 px-4 border text-left">SubExpert Review Status</th>
                  <th className="py-3 px-4 border text-left">Guide</th>
                  <th className="py-3 px-4 border text-left">Sub-Expert</th>
                </tr>
              </thead>
              <tbody>
                {filteredReviews.map((review) => (
                  <tr key={review.review_id} className="hover:bg-gray-50 border-b">
                    <td className="py-3 px-4">
                      {getReviewTypeBadge(review.review_type)}
                    </td>
                    <td className="py-3 px-4">
                      {formatDateTime(review.date, review.start_time, review.end_time)}
                    </td>
                    <td className="py-3 px-4">
                      {getModeBadge(review.review_mode)}
                    </td>
                    <td className="py-3 px-4">
                      {review.review_mode === 'online' ? (
                        <a 
                          href={review.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline break-all"
                        >
                          {review.meeting_link || 'No link provided'}
                        </a>
                      ) : (
                        <span>{review.venue || 'Venue not specified'}</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(review.guide_review_status)}
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(review.sub_expert_review_status)}
                    </td>
                    <td className="py-3 px-4">
                      {review.guide_name || review.guide_reg_num}
                    </td>
                    <td className="py-3 px-4">
                      {review.sub_expert_name || review.sub_expert_reg_num}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistics */}
      {reviews.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Total Reviews</h3>
            <p className="text-2xl font-bold text-blue-600">{reviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Upcoming</h3>
            <p className="text-2xl font-bold text-orange-600">{upcomingReviews.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-lg font-semibold text-gray-700">Completed</h3>
            <p className="text-2xl font-bold text-green-600">
              {reviews.filter(r => r.status === 'Completed').length}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewSchedules;