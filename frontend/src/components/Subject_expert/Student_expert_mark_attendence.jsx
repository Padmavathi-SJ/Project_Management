import React, { useState, useEffect, useRef } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';

function Student_expert_mark_attendence() {
  const [scheduledProjects, setScheduledProjects] = useState([]);
  const [originalProjects, setOriginalProjects] = useState([]);
  const inputRefs = useRef({}); // to store refs per project
  const selector = useSelector((Store) => Store.userSlice);

  async function fetchMentoringProjects() {
    try {
      let response = await instance.get(
        `/api/sub_expert/fetch_teams/${selector.reg_num}`
      );

      if (response.status === 200) {
        setScheduledProjects(response.data);
        setOriginalProjects(response.data);
        console.log(response.data);

        // Set up refs here
        const refs = {};
        response.data.forEach((project) => {
          refs[project.id] = React.createRef();
        });
        inputRefs.current = refs;
      } else {
        alert('Error fetching team details!');
      }
    } catch (err) {
      alert('Network error or server is down!');
    }
  }

  useEffect(() => {
    fetchMentoringProjects();
  }, []);

  const handleSave = (projectId) => {
    const newDateTime = inputRefs.current[projectId]?.current?.value;
    const isValid = validateSchedule(newDateTime);
    if (!isValid) {
      alert('Invalid date/time. Must be future date within 90 days and between 9AM–6PM.');
      return;
    }

    const updatedProjects = scheduledProjects.map((project) =>
      project.id === projectId ? { ...project, scheduledDateTime: newDateTime } : project
    );
    setScheduledProjects(updatedProjects);

    // TODO: Optionally send updated date/time to backend via axios.put or axios.post
  };

  const handleCancel = (projectId) => {
    const originalProject = originalProjects.find((project) => project.id === projectId);
    const updatedProjects = scheduledProjects.map((project) =>
      project.id === projectId ? { ...project, scheduledDateTime: originalProject.scheduledDateTime } : project
    );
    setScheduledProjects(updatedProjects);
    if (inputRefs.current[projectId]?.current) {
      inputRefs.current[projectId].current.value = originalProject.scheduledDateTime;
    }
  };

  const validateSchedule = (dateTimeStr) => {
    if (!dateTimeStr) return false;

    const now = new Date();
    const selected = new Date(dateTimeStr);

    if (isNaN(selected)) return false;

    const diffDays = Math.floor((selected - now) / (1000 * 60 * 60 * 24));
    const selectedHour = selected.getHours();

    return (
      selected > now &&
      diffDays <= 90 &&
      selectedHour >= 9 &&
      selectedHour < 18
    );
  };

  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold mb-6 text-center text-black">
        Schedule Projects for Review
      </h2>

      {scheduledProjects.length === 0 ? (
        <p className="text-gray-500">No projects scheduled for review yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scheduledProjects.map((project,index) => {
            const isValid = validateSchedule(project.scheduledDateTime);

            return (
              <div
                key={index}
                className="p-5 bg-white border rounded-lg shadow-md hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold text-gray-800">
                  {project.projectName}
                </h3>
                <p className="text-gray-600 mt-2">Team: Team: {project.project_name} (Team ID: {project.from_team_id})</p>
                <p className="text-gray-500 mt-1">
                  Current Schedule:{' '}
                  {new Date(project.scheduledDateTime).toLocaleString()}
                </p>

                {/* DateTime Input */}
                <div className="flex flex-col mt-4">
                  <label className="text-gray-700">New Schedule (Date & Time):</label>
                  <input
                    type="datetime-local"
                    defaultValue={project.scheduledDateTime}
                    ref={inputRefs.current[project.id]}
                    className="mt-2 p-2 border rounded"
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <button
                    className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                    onClick={() => handleSave(project.id)}
                  >
                    Save Schedule
                  </button>
                  <button
                    className="px-4 py-2 bg-gray-400 text-white rounded hover:bg-gray-500"
                    onClick={() => handleCancel(project.id)}
                  >
                    Cancel
                  </button>
                </div>

                {!isValid && (
                  <p className="text-red-500 text-sm mt-2">
                    Invalid: Date must be after today, within 90 days, and time between 9AM–6PM.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Student_expert_mark_attendence;
