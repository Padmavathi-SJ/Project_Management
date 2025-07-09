import React, { useEffect, useState, useMemo } from 'react';
import instance from '../../utils/axiosInstance';

function Admin_Dashboard() {
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    instance.get("/admin/show_team_numbers/")
      .then((res) => setTeams(res.data))
      .catch((err) => console.error("Failed to fetch team numbers:", err));

    instance.get('/teacher/getprojects')
      .then((res) => setProjects(res.data))
      .catch((err) => console.error('Failed to fetch projects:', err));
  }, []);

  const teamIdCount = {};
  teams.forEach((team) => {
    const id = team.team_id;
    if (id) teamIdCount[id] = (teamIdCount[id] || 0) + 1;
  });

  let soloTeams = 0;
  let duoTeams = 0;
  let trioTeams = 0;
  let squadTeams = 0;

  Object.values(teamIdCount).forEach((count) => {
    if (count === 1) soloTeams++;
    else if (count === 2) duoTeams++;
    else if (count === 3) trioTeams++;
    else if (count === 4) squadTeams++;
  });

  const stats = [
    { title: 'Total Teams', value: soloTeams + duoTeams + trioTeams + squadTeams },
    { title: 'Solo Teams', value: soloTeams },
    { title: 'Duo Teams', value: duoTeams },
    { title: 'Trio Teams', value: trioTeams },
    { title: 'Squad Teams', value: squadTeams },
  ];

  const upcoming = useMemo(() => (
    [...projects]
      .filter((t) => t.deadline)
      .sort((a, b) => new Date(a.deadline) - new Date(b.deadline))
      .slice(0, 2)
      .map((t) => ({ name: t.team_name, deadline: t.deadline }))
  ), [projects]);

  const activity = useMemo(() => (
    [...projects]
      .filter((t) => t.posted_date)
      .sort((a, b) => new Date(b.posted_date) - new Date(a.posted_date))
      .slice(0, 3)
      .map((t) => `Team "${t.project_name}" was posted on ${new Date(t.posted_date).toLocaleDateString()}.`)
  ), [projects]);

  return (
    <div className="p-6 rounded-xl h-[90%]">
      <h2 className="text-3xl font-bold flex justify-center mb-8">
        Admin Dashboard
      </h2>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl shadow hover:scale-105 transition duration-200">
            <p className="text-sm bg-white text-gray-500">{stat.title}</p>
            <h3 className="text-2xl bg-white font-semibold text-purple-500">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white p-6 rounded-2xl shadow mb-6 hover:scale-105 transition duration-200">
        <h3 className="text-xl font-semibold bg-white mb-4">Upcoming Deadlines</h3>
        <ul className="list-disc pl-6 bg-white space-y-2 text-gray-700">
          {upcoming.length > 0 ? (
            upcoming.map((item, index) => (
              <li key={index}>
                <span className="font-medium bg-white">{item.name}</span> — {item.deadline}
              </li>
            ))
          ) : (
            <p className="text-gray-500 bg-white ">No upcoming deadlines</p>
          )}
        </ul>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-6 rounded-2xl shadow hover:scale-105 transition duration-200">
        <h3 className="text-xl font-semibold mb-4 bg-white ">Recent Activity</h3>
        {activity.length>0?(
          <ul className="list-disc pl-6 bg-white  space-y-2 text-gray-700">
          {activity.map((act, index) => (
            <li key={index} className=' bg-white '>{act}</li>
          ))}
        </ul>):
        <p>No recent Activity</p>}
      </div>
    </div>
  );
}

export default Admin_Dashboard;