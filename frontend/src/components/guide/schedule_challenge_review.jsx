import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import instance from '../../utils/axiosInstance';

const ScheduleChallengeReview = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isScheduled, setIsScheduled] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    review_mode: 'online',
    Date: '',
    start_time: '',
    end_time: '',
    venue: '',
    meeting_link: ''
  });

  // Initialize form with assignment data if available
  useEffect(() => {
    if (state?.assignmentData) {
      const { assignmentData } = state;
      setFormData(prev => ({
        ...prev,
        student_reg_num: assignmentData.student_reg_num,
        team_id: assignmentData.team_id,
        project_id: assignmentData.project_id,
        semester: assignmentData.semester,
        review_type: assignmentData.review_type,
        pmc1_reg_num: assignmentData.pmc1_reg_num,
        pmc2_reg_num: assignmentData.pmc2_reg_num
      }));

      // Check if already scheduled
      checkIfScheduled(assignmentData);
    }
  }, [state]);

  const checkIfScheduled = async (assignmentData) => {
    try {
      const response = await instance.get(
        `/api/challenge-reviews/scheduled-reviews/${assignmentData.pmc1_reg_num}`
      );
      
      if (response.data.status) {
        const isAlreadyScheduled = response.data.data.some(review => 
          review.student_reg_num === assignmentData.student_reg_num && 
          review.review_type === assignmentData.review_type
        );
        setIsScheduled(isAlreadyScheduled);
      }
    } catch (err) {
      console.error('Error checking scheduled reviews:', err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isScheduled) return;
    
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.Date || !formData.start_time || !formData.end_time) {
        throw new Error('Date and time are required');
      }

      if (formData.review_mode === 'online' && !formData.meeting_link) {
        throw new Error('Meeting link is required for online reviews');
      }

      if (formData.review_mode === 'offline' && !formData.venue) {
        throw new Error('Venue is required for offline reviews');
      }

      // Format the data for backend
      const reviewData = {
        ...formData,
        Date: format(parseISO(formData.Date), 'yyyy-MM-dd'),
        start_time: formData.start_time,
        end_time: formData.end_time
      };

      const response = await instance.post(
        `/api/challenge-reviews/schedule/${formData.pmc1_reg_num}`,
        reviewData
      );

      if (response.data.status) {
        setSuccess(true);
        setIsScheduled(true);
        setTimeout(() => {
          navigate('/guide/challenge_reviews');
        }, 2000);
      }
    } catch (err) {
      console.error('Error scheduling review:', err);
      setError(err.response?.data?.error || err.message || 'Failed to schedule review');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">Review scheduled successfully! Redirecting...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          {isScheduled ? 'Review Already Scheduled' : 'Schedule Challenge Review'}
        </h1>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
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
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Info */}
            <div className="col-span-2 bg-gray-50 p-4 rounded-lg">
              <h3 className="text-lg font-medium text-gray-700 mb-3">Review Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Student</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.student_reg_num} {state?.assignmentData?.student_name && `(${state.assignmentData.student_name})`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Team</label>
                  <p className="mt-1 text-sm text-gray-900">{formData.team_id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Project</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {formData.project_id} {state?.assignmentData?.project_name && `(${state.assignmentData.project_name})`}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Type</label>
                  <p className="mt-1 text-sm text-gray-900 capitalize">
                    {formData.review_type?.replace('-', ' ')}
                  </p>
                </div>
                {isScheduled && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <p className="text-sm text-green-700">This review has already been scheduled.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Only show form fields if not already scheduled */}
            {!isScheduled && (
              <>
                {/* Review Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Review Mode</label>
                  <div className="mt-1 space-y-2">
                    <div className="flex items-center">
                      <input
                        id="online-mode"
                        name="review_mode"
                        type="radio"
                        value="online"
                        checked={formData.review_mode === 'online'}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="online-mode" className="ml-2 block text-sm text-gray-700">
                        Online
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="offline-mode"
                        name="review_mode"
                        type="radio"
                        value="offline"
                        checked={formData.review_mode === 'offline'}
                        onChange={handleChange}
                        className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                      />
                      <label htmlFor="offline-mode" className="ml-2 block text-sm text-gray-700">
                        Offline
                      </label>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                    Date
                  </label>
                  <input
                    type="date"
                    name="Date"
                    id="date"
                    value={formData.Date}
                    onChange={handleChange}
                    min={new Date().toISOString().split('T')[0]}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Start Time */}
                <div>
                  <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
                    Start Time
                  </label>
                  <input
                    type="time"
                    name="start_time"
                    id="start_time"
                    value={formData.start_time}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                {/* End Time */}
                <div>
                  <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
                    End Time
                  </label>
                  <input
                    type="time"
                    name="end_time"
                    id="end_time"
                    value={formData.end_time}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    required
                  />
                </div>

                {/* Venue (conditional) */}
                {formData.review_mode === 'offline' && (
                  <div className="col-span-2">
                    <label htmlFor="venue" className="block text-sm font-medium text-gray-700">
                      Venue
                    </label>
                    <input
                      type="text"
                      name="venue"
                      id="venue"
                      value={formData.venue}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required={formData.review_mode === 'offline'}
                    />
                  </div>
                )}

                {/* Meeting Link (conditional) */}
                {formData.review_mode === 'online' && (
                  <div className="col-span-2">
                    <label htmlFor="meeting_link" className="block text-sm font-medium text-gray-700">
                      Meeting Link
                    </label>
                    <input
                      type="url"
                      name="meeting_link"
                      id="meeting_link"
                      value={formData.meeting_link}
                      onChange={handleChange}
                      placeholder="https://meet.example.com/your-meeting"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      required={formData.review_mode === 'online'}
                    />
                  </div>
                )}
              </>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Back
            </button>
            {!isScheduled ? (
              <button
                type="submit"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Schedule Review
              </button>
            ) : (
              <button
                type="button"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 cursor-default"
                disabled
              >
                Already Scheduled
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleChallengeReview;