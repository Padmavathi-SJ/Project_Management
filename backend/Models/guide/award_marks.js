const db = require('../../db.js');

const s5_s6_FirstReviewMarks = async (marksData) => {
  const query = `
    INSERT INTO s5_s6_first_review_marks_byGuide (
      student_reg_num,
      guide_reg_num,
      team_id,
      attendance,
      literature_review,
      Aim_Objective_of_the_project,
      Scope_of_the_project,
      Need_for_the_current_study,
      Proposed_Methodology,
      Project_work_Plan,
      Oral_Presentation,
      Viva_Voce_PPT,
      Contributions_to_the_work_and_worklog
    ) VALUES ?`;
  
  const values = marksData.map(mark => [
    mark.student_reg_num,
    mark.guide_reg_num,
    mark.team_id,
    mark.attendance || 'present',
    mark.literature_review,
    mark.Aim_Objective_of_the_project,
    mark.Scope_of_the_project,
    mark.Need_for_the_current_study,
    mark.Proposed_Methodology,
    mark.Project_work_Plan,
    mark.Oral_Presentation,
    mark.Viva_Voce_PPT,
    mark.Contributions_to_the_work_and_worklog
  ]);

  return new Promise((resolve, reject) => {
    db.query(query, [values], (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
  });
};

const getTeamMembers = async (team_id) => {
  const query = `
    SELECT reg_num 
    FROM teams 
    WHERE team_id = ?`;
  
  return new Promise((resolve, reject) => {
    db.query(query, [team_id], (err, result) => {
      if (err) return reject(err);
      resolve(result.map(row => row.reg_num));
    });
  });
};

module.exports = {
  s5_s6_FirstReviewMarks,
  getTeamMembers
};