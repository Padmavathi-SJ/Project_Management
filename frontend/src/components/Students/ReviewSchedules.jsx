import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

const ReviewSchedules = () => {
  const teamSelector = useSelector((state) => state.teamSlice);
  const [activeTab, setActiveTab] = useState('guide');
  const [guideReviews, setGuideReviews] = useState([]);
  const [subExpertReviews, setSubExpertReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (teamSelector && teamSelector[0]?.team_id) {
      fetchReviews();
    }
  }, [teamSelector]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch both guide and sub-expert reviews in parallel
      const [guideResponse, subExpertResponse] = await Promise.all([
        instance.get(`/reviews/guide-reviews/${teamSelector[0].team_id}`),
        instance.get(`/reviews/sub-expert-reviews/${teamSelector[0].team_id}`)
      ]);

      setGuideReviews(guideResponse.data.reviews || []);
      setSubExpertReviews(subExpertResponse.data.reviews || []);
    } catch (err) {
      console.error("Error fetching reviews:", err);
      setError("Failed to load review schedules. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateString, timeString) => {
    const date = new Date(dateString);
    const time = timeString.split(':');
    date.setHours(time[0], time[1], time[2]);
    return date.toLocaleString();
  };

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
          className={`py-2 px-4 font-medium ${activeTab === 'guide' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('guide')}
        >
          Guide Reviews
        </button>
        <button
          className={`py-2 px-4 font-medium ${activeTab === 'subExpert' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('subExpert')}
        >
          Sub-expert Reviews
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

      {/* Guide Reviews Tab */}
      {activeTab === 'guide' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Guide Review Schedules</h2>
          <hr className="mb-4" />
          
          {guideReviews.length === 0 ? (
            <p className="text-gray-500">No guide reviews scheduled for this team.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Review Type</th>
                    <th className="py-2 px-4 border text-left">Date & Time</th>
                    <th className="py-2 px-4 border text-left">Venue</th>
                    <th className="py-2 px-4 border text-left">Meeting Link</th>
                  </tr>
                </thead>
                <tbody>
                  {guideReviews.map((review) => (
                    <tr key={review.review_id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{review.review_type}</td>
                      <td className="py-2 px-4 border">
                        {formatDateTime(review.date, review.time)}
                      </td>
                      <td className="py-2 px-4 border">{review.venue}</td>
                      <td className="py-2 px-4 border">
                        <a 
                          href={review.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Sub-expert Reviews Tab */}
      {activeTab === 'subExpert' && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 text-black">Sub-expert Review Schedules</h2>
          <hr className="mb-4" />
          
          {subExpertReviews.length === 0 ? (
            <p className="text-gray-500">No sub-expert reviews scheduled for this team.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="py-2 px-4 border text-left">Review Type</th>
                    <th className="py-2 px-4 border text-left">Date & Time</th>
                    <th className="py-2 px-4 border text-left">Venue</th>
                    <th className="py-2 px-4 border text-left">Meeting Link</th>
                  </tr>
                </thead>
                <tbody>
                  {subExpertReviews.map((review) => (
                    <tr key={review.review_id} className="hover:bg-gray-50">
                      <td className="py-2 px-4 border">{review.review_type}</td>
                      <td className="py-2 px-4 border">
                        {formatDateTime(review.date, review.time)}
                      </td>
                      <td className="py-2 px-4 border">{review.venue}</td>
                      <td className="py-2 px-4 border">
                        <a 
                          href={review.meeting_link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline"
                        >
                          Join Meeting
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ReviewSchedules;