import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import instance from '../../utils/axiosInstance';
import { format } from 'date-fns';

const ChallengeReviews = () => {
  const userRegNum = useSelector((state) => state.userSlice?.reg_num);
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState([]);
  const [scheduledReviews, setScheduledReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userRegNum) {
      setError('User registration number not found');
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [assignmentsRes, reviewsRes] = await Promise.all([
          instance.get(`/api/challenge-reviews/assignments/${userRegNum}`),
          instance.get(`/api/challenge-reviews/scheduled-reviews/${userRegNum}`)
        ]);

        if (assignmentsRes.data.status) {
          setAssignments(assignmentsRes.data.data || []);
        }

        if (reviewsRes.data.status) {
          setScheduledReviews(reviewsRes.data.data || []);
        }

      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err.response?.data?.error || err.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userRegNum]);

  const handleScheduleReview = (assignment) => {
    navigate('/guide/schedule_challenge_review', {
      state: {
        assignmentData: assignment
      }
    });
  };

  const handleUpdateStatus = async (reviewId, newStatus) => {
    try {
      await instance.patch(`/api/challenge-reviews/${reviewId}/status/${userRegNum}`, {
        status: newStatus
      });
      
      setScheduledReviews(prev => prev.map(review => 
        review.review_id === reviewId ? { 
          ...review, 
          pmc1_review_status: review.pmc1_reg_num === userRegNum ? newStatus : review.pmc1_review_status,
          pmc2_review_status: review.pmc2_reg_num === userRegNum ? newStatus : review.pmc2_review_status
        } : review
      ));
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.response?.data?.error || err.message || "Failed to update status");
    }
  };

  const handleAwardMarks = (review) => {
    navigate(`/guide/award_challenge_marks/${userRegNum}/team/${review.team_id}`, {
      state: {
        reviewData: {
          semester: review.semester,
          review_type: review.review_type,
          student_reg_num: review.student_reg_num,
          user_role: review.pmc1_reg_num === userRegNum ? 'pmc1' : 'pmc2'
        }
      }
    });
  };

  const formatDateTime = (date, time) => {
    if (!date || !time) return 'Not scheduled';
    try {
      const dateObj = new Date(`${date}T${time}`);
      return format(dateObj, 'MMM dd, yyyy hh:mm a');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Invalid date/time';
    }
  };

  const renderAssignmentsTable = () => {
    return (
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Team</th>
              <th className="py-3 px-4 text-left">Project</th>
              <th className="py-3 px-4 text-left">Semester</th>
              <th className="py-3 px-4 text-left">Review Type</th>
              <th className="py-3 px-4 text-left">PMC1</th>
              <th className="py-3 px-4 text-left">PMC2</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.assignment_id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{assignment.student_name || assignment.student_reg_num}</td>
                <td className="py-3 px-4">{assignment.team_id}</td>
                <td className="py-3 px-4">{assignment.project_name || assignment.project_id}</td>
                <td className="py-3 px-4">Semester {assignment.semester}</td>
                <td className="py-3 px-4">
                  <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {assignment.review_type.replace('-', ' ')}
                  </span>
                </td>
                <td className="py-3 px-4">{assignment.pmc1_reg_num}</td>
                <td className="py-3 px-4">{assignment.pmc2_reg_num}</td>
                <td className="py-3 px-4">
                  {assignment.is_pmc1 && (
                    <button
                      onClick={() => handleScheduleReview(assignment)}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                    >
                      Schedule
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

  const renderScheduledReviewsTable = () => {
    return (
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4 text-left">Student</th>
              <th className="py-3 px-4 text-left">Project</th>
              <th className="py-3 px-4 text-left">Date & Time</th>
              <th className="py-3 px-4 text-left">Mode</th>
              <th className="py-3 px-4 text-left">Venue/Link</th>
              <th className="py-3 px-4 text-left">PMC1 Status</th>
              <th className="py-3 px-4 text-left">PMC2 Status</th>
              <th className="py-3 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {scheduledReviews.map((review) => {
              const isPMC1 = review.pmc1_reg_num === userRegNum;
              const isPMC2 = review.pmc2_reg_num === userRegNum;
              const currentStatus = isPMC1 ? review.pmc1_review_status : 
                                  isPMC2 ? review.pmc2_review_status : 'Not assigned';
              const canAwardMarks = (isPMC1 && review.pmc1_review_status === 'Completed') || 
                                   (isPMC2 && review.pmc2_review_status === 'Completed');

              return (
                <tr key={review.review_id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{review.name || review.student_reg_num}</td>
                  <td className="py-3 px-4">{review.project_name || review.project_id}</td>
                  <td className="py-3 px-4">
                    {formatDateTime(review.Date, review.start_time)} - {review.end_time}
                  </td>
                  <td className="py-3 px-4 capitalize">{review.review_mode}</td>
                  <td className="py-3 px-4">
                    {review.review_mode === 'online' ? (
                      <a href={review.meeting_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Join Meeting
                      </a>
                    ) : (
                      review.venue || 'Not specified'
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={review.pmc1_review_status} />
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={review.pmc2_review_status} />
                  </td>
                  <td className="py-3 px-4 space-x-2">
                    {(isPMC1 || isPMC2) && (
                      <>
                        <select
                          value={currentStatus}
                          onChange={(e) => handleUpdateStatus(review.review_id, e.target.value)}
                          className="border rounded px-2 py-1 text-sm"
                        >
                          <option value="Not completed">Not completed</option>
                          <option value="Completed">Completed</option>
                          <option value="Rescheduled">Rescheduled</option>
                        </select>
                        {canAwardMarks && (
                          <button
                            onClick={() => handleAwardMarks(review)}
                            className="ml-2 px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 text-sm"
                          >
                            Award Marks
                          </button>
                        )}
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const StatusBadge = ({ status }) => {
    const statusColors = {
      'Completed': 'bg-green-100 text-green-800',
      'Not completed': 'bg-yellow-100 text-yellow-800',
      'Rescheduled': 'bg-blue-100 text-blue-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-l-4 border-red-500 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Challenge Review Management</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('assignments')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'assignments' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              My Assignments
            </button>
            <button
              onClick={() => setActiveTab('scheduled')}
              className={`py-4 px-6 text-center border-b-2 font-medium text-sm ${activeTab === 'scheduled' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            >
              Scheduled Reviews
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'assignments' ? (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Review Assignments</h2>
              {assignments.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-blue-700">No challenge review assignments found.</p>
                </div>
              ) : (
                renderAssignmentsTable()
              )}
            </>
          ) : (
            <>
              <h2 className="text-xl font-semibold text-gray-700 mb-4">Scheduled Reviews</h2>
              {scheduledReviews.length === 0 ? (
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <p className="text-blue-700">No scheduled challenge reviews found.</p>
                </div>
              ) : (
                renderScheduledReviewsTable()
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeReviews;