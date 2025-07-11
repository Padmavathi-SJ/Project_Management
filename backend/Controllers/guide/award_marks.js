const { s5_s6_FirstReviewMarks, getTeamMembers } = require('../../Models/guide/award_marks.js');

const submit_s5_s6_first_ReviewMarks = async (req, res) => {
  try {
    const { team_id, guide_reg_num } = req.params;
    const { marks } = req.body;

    // Validate input
    if (!team_id || !guide_reg_num || !marks || !Array.isArray(marks)) {
      return res.status(400).json({
        status: false,
        error: 'Invalid request parameters or marks data'
      });
    }

    // Get team members to validate student registration numbers
    const teamMembers = await getTeamMembers(team_id);
    const invalidStudents = marks.filter(
      mark => !teamMembers.includes(mark.student_reg_num)
    );

    if (invalidStudents.length > 0) {
      return res.status(400).json({
        status: false,
        error: 'One or more students are not part of this team',
        invalidStudents: invalidStudents.map(s => s.student_reg_num)
      });
    }

    // Add team_id and guide_reg_num to each mark record
    const marksData = marks.map(mark => ({
      ...mark,
      team_id,
      guide_reg_num
    }));

    // Insert marks
    const result = await s5_s6_FirstReviewMarks(marksData);

    res.json({
      status: true,
      message: 'Marks submitted successfully',
      affectedRows: result.affectedRows
    });

  } catch (error) {
    console.error('Error submitting marks:', error);
    res.status(500).json({
      status: false,
      error: error.message || 'Failed to submit marks'
    });
  }
};

module.exports = {
  submit_s5_s6_first_ReviewMarks
};