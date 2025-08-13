const db = require('../db.js');

// Add this function to your existing auth middleware
const checkSeniorStaff = async (staffRegNum, studentRegNum) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 1 FROM challenge_review_reviewers_assignment
      WHERE student_reg_num = ? AND pmc1_reg_num = ?
      LIMIT 1
    `;
    
    db.query(query, [studentRegNum, staffRegNum], (err, results) => {
      if (err) return reject(err);
      resolve(results.length > 0);
    });
  });
};

module.exports = {
  checkSeniorStaff
};