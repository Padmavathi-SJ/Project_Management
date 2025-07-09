import React, { useState } from "react";

const sampleProjects = [
  {
    id: 1,
    name: "Smart Attendance System",
    teamLead: "Keerthana M",
    phases: [
      { phase: "Phase 1", scheduledDate: "2025-05-20T09:00:00", mark: null },
      { phase: "Phase 2", scheduledDate: "2025-05-10T10:00:00", mark: null },
      { phase: "Phase 3", scheduledDate: "2025-05-14T10:00:00", mark: null },
    ],
  },
];

function Subject_expert_remarks() {
  const [projects, setProjects] = useState(sampleProjects);
  const [inputMarks, setInputMarks] = useState({});

  const handleMarkChange = (projectId, phaseIndex, value) => {
    setInputMarks((prev) => ({
      ...prev,
      [`${projectId}-${phaseIndex}`]: value,
    }));
  };

  const handleSubmit = (projectId, phaseIndex) => {
    const key = `${projectId}-${phaseIndex}`;
    const mark = parseFloat(inputMarks[key]);

    if (isNaN(mark) || mark < 0 || mark > 10) {
      alert("Enter valid marks (0–10)");
      return;
    }

    const updatedProjects = projects.map((project) => {
      if (project.id === projectId) {
        const updatedPhases = [...project.phases];
        updatedPhases[phaseIndex].mark = mark;

        return {
          ...project,
          phases: updatedPhases,
        };
      }
      return project;
    });

    setProjects(updatedProjects);
    setInputMarks((prev) => ({ ...prev, [key]: "" }));
  };

  const isReviewOpen = (scheduledDate) => {
    const now = new Date();
    const scheduled = new Date(scheduledDate);
    const diff = now - scheduled;

    return diff >= 0 && diff <= 2 * 24 * 60 * 60 * 1000;
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl flex justify-center font-bold text-black mb-6">
        Subject Expert - Phase-wise Remarks
      </h2>

      {projects.map((project) => (
        <div
          key={project.id}
          className="mb-8 p-6 bg-white rounded shadow border"
        >
          <h3 className="text-xl bg-white  font-semibold">{project.name}</h3>
          <p className="text-gray-700 bg-white ">
            <strong className=" bg-white ">Team Lead:</strong> {project.teamLead}
          </p>

          {project.phases.map((phase, index) => {
            const key = `${project.id}-${index}`;
            const reviewStarted = new Date() >= new Date(phase.scheduledDate);
            const isWithin2Days = isReviewOpen(phase.scheduledDate);
            const canEnter = reviewStarted && isWithin2Days && phase.mark === null;

            return (
              <div
                key={index}
                className="mt-4 p-4 border shadow-sm rounded bg-white"
              >
                <p className="font-medium bg-white  text-purple-500">{phase.phase}</p>
                <p className="text-gray-600 bg-white ">
                  <strong className=" bg-white ">Scheduled:</strong>{" "}
                  {new Date(phase.scheduledDate).toLocaleString()}
                </p>

                {phase.mark !== null ? (
                  <p className="mt-2 text-green-600 bg-white  font-semibold">
                     Marks Entered: {phase.mark}/10
                  </p>
                ) : canEnter ? (<>
                  <div className="mt-2 flex mb-5 items-center bg-white gap-2">
                    
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={inputMarks[key] || ""}
                      onChange={(e) =>
                        handleMarkChange(project.id, index, e.target.value)
                      }
                      placeholder="Enter mark (0-50)"
                      className="border p-2 min-w-48 bg-white rounded w-32"
                    />
                    <button
                      onClick={() => handleSubmit(project.id, index)}
                      className="px-4 py-2 bg-green-600  text-white rounded hover:bg-green-700"
                    >
                      Submit
                    </button>
                  </div>
                  <textarea className="w-full min-h-28 p-2 relative bg-white border min-w-" placeholder="Enter Remarks ..."></textarea>
                  </>
                ) : (
                  <p className="mt-2 text-red-500 bg-white  font-semibold">
                    {reviewStarted
                      ? "Mark entry window expired (after 2 days)"
                      : "Review time has not started yet"}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Subject_expert_remarks;
