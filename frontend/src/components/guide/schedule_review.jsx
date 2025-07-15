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
    semester: '5', // Default to semester 5
    review_type: 'review-1',
    venue: '',
    date: '',
    time: '',
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!guideRegNum) {
      alert('Guide registration number not found');
      return;
    }

    try {
      const selectedTeam = teams.find((t) => t.team_id === formData.team_id);
      const response = await instance.post(`/api/guide/${guideRegNum}/schedule`, {
        ...formData,
        project_id: selectedTeam?.project_id || ''
      });

      alert(response.data.message || 'Review scheduled successfully!');
      if (onSuccess) onSuccess();
      navigate('/guide/schedule-review');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to schedule review');
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
              onChange={handleChange}
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

          {/* Venue */}
          <div>
            <label className="block text-gray-700 mb-2">Venue</label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
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

          {/* Time */}
          <div>
            <label className="block text-gray-700 mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
          </div>

          {/* Meeting Link */}
          <div className="md:col-span-2">
            <label className="block text-gray-700 mb-2">Meeting Link (Optional)</label>
            <input
              type="url"
              name="meeting_link"
              value={formData.meeting_link}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="https://meet.example.com/your-meeting"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            className="px-6 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
          >
            Schedule Review
          </button>
        </div>
      </form>
    </div>
  );
};

export default ScheduleReview;