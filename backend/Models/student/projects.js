const db = require('../../db.js');

const ProjectModel = {
  // Get team leader registration number
  getTeamLeader: (team_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT reg_num 
        FROM teams 
        WHERE team_id = ? AND is_leader = 1
      `;
      db.query(query, [team_id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]?.reg_num);
      });
    });
  },

// Updated getTeamDepartments function
getTeamDepartments: (team_id) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT DISTINCT u.dept 
      FROM teams t
      JOIN users u ON t.reg_num = u.reg_num
      WHERE t.team_id = ? AND u.dept IS NOT NULL
    `;
    db.query(query, [team_id], (err, results) => {
      if (err) return reject(err);
      resolve(results.map(row => row.dept));
    });
  });
},
  // Get available staff (both guides and experts)
  getAvailableStaff: () => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT reg_num, name, dept, role 
        FROM users 
        WHERE role IN ('staff') AND available = 1
      `;
      db.query(query, (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
  },

  // Create new project
  createProject: (projectData) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO projects (
          project_id, team_id, project_name, cluster, 
          description, outcome, hard_soft, project_type, tl_reg_num
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      db.query(query, [
        projectData.project_id,
        projectData.team_id,
        projectData.project_name,
        projectData.cluster,
        projectData.description,
        projectData.outcome,
        projectData.hard_soft,
        projectData.project_type,
        projectData.tl_reg_num
      ], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Update team with project ID
  updateTeamProject: (team_id, project_id) => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE teams SET project_id = ? 
        WHERE team_id = ?
      `;
      db.query(query, [project_id, team_id], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Send guide requests
  sendGuideRequests: (requests) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO guide_requests (
          from_team_id, project_id, to_guide_reg_num, 
          project_name, team_semester
        ) VALUES ?
      `;
      const values = requests.map(req => [
        req.from_team_id,
        req.project_id,
        req.to_guide_reg_num,
        req.project_name,
        req.team_semester
      ]);
      db.query(query, [values], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

  // Send expert requests
  sendExpertRequests: (requests) => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO sub_expert_requests (
          from_team_id, project_id, to_expert_reg_num, 
          project_name, team_semester
        ) VALUES ?
      `;
      const values = requests.map(req => [
        req.from_team_id,
        req.project_id,
        req.to_expert_reg_num,
        req.project_name,
        req.team_semester
      ]);
      db.query(query, [values], (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  },

// In models/project.js
generateProjectId: () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT MAX(CAST(SUBSTRING(project_id, 2) AS UNSIGNED)) AS max_id 
      FROM projects
    `;
    db.query(query, (err, results) => {
      if (err) return reject(err);
      const nextId = (results[0].max_id || 0) + 1;
      const project_id = `P${String(nextId).padStart(4, "0")}`;
      resolve(project_id);
    });
  });
}
}

module.exports = ProjectModel;