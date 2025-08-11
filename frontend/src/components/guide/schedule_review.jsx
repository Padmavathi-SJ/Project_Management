import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

const ScheduleReview = ({ onSuccess }) => {
  const navigate = useNavigate();
  const guideRegNum = useSelector((state) => state.userSlice?.reg_num);

  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    team_id: '',
    project_id: '',
    semester: '5', // Default to semester 5
    review_type: 'review-1',
    review_mode: 'offline',
    venue: '',
    date: '',
    start_time: '',
    end_time: '',
    meeting_link: ''
  });

  useEffect(() => {
    if (!guideRegNum) {
      setError('Guide registration number not found');
      setLoading(false);
      return;
    }

    const fetchTeams = async () => {
      try {
        setLoading(true);
        const response = await instance.get(`/api/guide/${guideRegNum}/teams`);
        setTeams(response.data.teams);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch teams');
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [guideRegNum]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTeamSelect = (e) => {
    const teamId = e.target.value;
    const selectedTeam = teams.find((t) => t.team_id === teamId);
    setFormData((prev) => ({
      ...prev,
      team_id: teamId,
      project_id: selectedTeam?.project_id || '' 
    }));
  }


const handleSubmit = async (e) => {
  e.preventDefault();
  if (!guideRegNum) {
    alert('Guide registration number not found');
    return;
  }

  // Validate time
  if (formData.start_time >= formData.end_time) {
    alert('End time must be after start time');
    return;
  }

  try {
    setLoading(true);
    const response = await instance.post(
      `/api/guide/${guideRegNum}/schedule`,
      formData // Send formData directly, not wrapped in an object
    );

    if (response.data && response.data.status === true) {
      alert(response.data.message || 'Review scheduled successfully!');
      if (onSuccess) onSuccess();
      navigate('/guide/schedule-review');
    } else {
      throw new Error(response.data?.error || 'Failed to schedule review');
    }
  } catch (err) {
    console.error('Error scheduling review:', err);
    alert(
      err.response?.data?.error || 
      err.response?.data?.message ||
      err.message ||
      'Failed to schedule review'
    );
  } finally {
    setLoading(false);
  }
};

  if (loading) return <div className="p-4">Loading teams...</div>;
  if (error) return <div className="p-4 text-red-500">{error}</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Schedule Review</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Team Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Team</label>
            <select
              name="team_id"
              value={formData.team_id}
              onChange={handleTeamSelect}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="">Select a team</option>
              {teams.map((team) => (
                <option key={team.team_id} value={team.team_id}>
                  Team {team.team_id} (Project: {team.project_id})
                </option>
              ))}
            </select>
          </div>

          {/* Project ID (auto-filled) */}
          <div>
            <label className='block text-gray-700 mb-2'>Project ID</label>
            <input
            type='text'
            name="project_id"
            value={formData.project_id}
            readOnly
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-100"
            />
          </div>

          {/* Semester Selection */}
          <div>
            <label className="block text-gray-700 mb-2">Semester</label>
            <select
              name="semester"
              value={formData.semester}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
              <option value="7">Semester 7</option>
              <option value="8">Semester 8</option>
            </select>
          </div>

          {/* Review Type */}
          <div>
            <label className="block text-gray-700 mb-2">Review Type</label>
            <select
              name="review_type"
              value={formData.review_type}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="review-1">Review 1</option>
              <option value="review-2">Review 2</option>
            </select>
          </div>

          {/* Review Mode */}
          <div>
            <label className="block text-gray-700 mb-2">Review Mode</label>
            <select
              name="review_mode"
              value={formData.review_mode}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            >
              <option value="offline">Offline</option>
              <option value="online">Online</option>
            </select>
          </div>

          {/* Venue */}
          <div>
            <label className="block text-gray-700 mb-2">
              {formData.review_mode === 'online' ? 'Meeting Platform' : 'Venue'}
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
              placeholder={formData.review_mode === 'online' ? 'e.g., Google Meet, Zoom' : 'e.g., Room 101, CS Department'}
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Start Time */}
          <div>
            <label className="block text-gray-700 mb-2">Start Time</label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* End Time */}
          <div>
            <label className="block text-gray-700 mb-2">End Time</label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Meeting Link (shown only for online) */}
          {formData.review_mode === 'online' && (
            <div className="md:col-span-2">
              <label className="block text-gray-700 mb-2">Meeting Link</label>
              <input
                type="url"
                name="meeting_link"
                value={formData.meeting_link}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://meet.example.com/your-meeting"
              />
            </div>
          )}
        </div>
        <div className="flex justify-end mt-6">
          <button
  type="submit"
  disabled={loading}
  className={`px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
    loading ? 'opacity-50 cursor-not-allowed' : ''
  }`}
>
  {loading ? 'Scheduling...' : 'Schedule Review'}
</button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleReview;