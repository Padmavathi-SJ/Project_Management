import React, { useState, useEffect } from "react";
import instance from "../../utils/axiosInstance";
import { useSelector } from "react-redux";

function Student_expert_review() {
  const [projects, setProjects] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [timers, setTimers] = useState({});
  const [attendanceMarked, setAttendanceMarked] = useState({});
  const [markedAbsent, setMarkedAbsent] = useState({});
  const selector = useSelector((Store) => Store.userSlice);

  useEffect(() => {
    fetchReviewRequests();
  }, []);

  const fetchReviewRequests = async () => {
    try {
      const res = await instance.get(
        `/sub_expert/fetch_upcoming_reviews/${selector.reg_num}`
      );
      setProjects(res.data);
    } catch (error) {
      console.error("Failed to fetch review requests:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();

      if (activeReview) {
        const elapsed = Math.floor((now - activeReview.startTime) / 1000);
        const projectId = activeReview.projectId;
        const teamId = activeReview.teamId;

        setTimers((prev) => ({ ...prev, [projectId]: elapsed }));

        if (elapsed >= 60 && !attendanceMarked[teamId]) {
          markAttendance(teamId);
        }
      }

      const nowDate = new Date();
      projects.forEach((project) => {
        const scheduled = new Date(`${project.review_date}T${project.start_time}`);
        const diff = nowDate - scheduled;

        if (
          diff > 2 * 60 * 60 * 1000 &&
          !attendanceMarked[project.team_id] &&
          !markedAbsent[project.team_id]
        ) {
          setMarkedAbsent((prev) => ({
            ...prev,
            [project.team_id]: true,
          }));
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeReview, attendanceMarked, markedAbsent, projects]);

  const markAttendance = async (teamId) => {
    try {
      await instance.patch(`/sub_expert/mark_attendance/${teamId}`);
      setAttendanceMarked((prev) => ({ ...prev, [teamId]: true }));
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    }
  };

  const handleStartReview = (projectId, teamId, scheduledDate, startTime) => {
    const now = new Date();
    const scheduled = new Date(`${scheduledDate}T${startTime}`);
    if (now - scheduled > 2 * 60 * 60 * 1000) {
      alert("Review cannot be started. You are marked absent.");
      return;
    }
    setActiveReview({ projectId, teamId, startTime: Date.now() });
    setTimers((prev) => ({ ...prev, [projectId]: 0 }));
  };

  const handleStopReview = () => {
    setActiveReview(null);
  };

  const formatTime = (seconds) => {
    if (seconds < 0) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {projects.length === 0 ? (
          <div className="text-center text-gray-600">
            <p>No upcoming reviews available.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {projects.map((project) => {
              const projectId = project.project_id;
              const teamId = project.team_id;
              const isActive = activeReview?.projectId === projectId;
              const timerValue = timers[projectId] || 0;
              const isPresent = attendanceMarked[teamId];
              const isAbsent = markedAbsent[teamId];

              const datePart = new Date(project.review_date).toLocaleDateString();
              const timePart = project.start_time;

              const now = new Date();
              const scheduled = new Date(`${project.review_date}T${project.start_time}`);
              const diffInMs = now - scheduled;
              const showBeforeTime = diffInMs < 0;

              return (
                <div
                  key={projectId}
                  className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100"
                >
                  <div className="p-4 sm:p-6 flex flex-col sm:grid sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 truncate">
                        {project.project_name}
                      </h3>
                      <p className="mt-2 text-gray-600 truncate">
                        <span className="font-medium">Team Lead:</span>{" "}
                        {project.team_lead}
                      </p>
                      <p className="mt-1 text-gray-600">
                        <span className="font-medium">Scheduled:</span> {datePart}{" "}
                        <span className="text-gray-500">at</span> {timePart}
                      </p>
                    </div>

                    <div className="flex flex-col items-start sm:items-end space-y-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">Timer:</span>
                        <span className="text-lg font-mono" aria-live="polite">
                          {formatTime(timerValue)}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-green-600 font-semibold mt-2">
                          {isPresent && "Attendance Marked"}
                        </p>
                        {!isPresent && isAbsent && (
                          <p className="text-red-600 bg-white font-semibold mt-2">Absent</p>
                        )}
                        {!isPresent && !isAbsent && showBeforeTime && (
                          <p className="text-yellow-600 font-semibold mt-2">
                            Review time has not started yet
                          </p>
                        )}
                      </div>

                      <div className="mt-4 flex gap-4">
                        <button
                          onClick={() =>
                            handleStartReview(projectId, teamId, project.review_date, project.start_time)
                          }
                          disabled={isActive || isAbsent || showBeforeTime || isPresent}

                          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:bg-gray-400"
                        >
                          Start Review
                        </button>
                        <button
                          onClick={handleStopReview}
                          disabled={!isActive}
                          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:bg-gray-400"
                        >
                          Stop Review
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );s
}

export default Student_expert_review;   

