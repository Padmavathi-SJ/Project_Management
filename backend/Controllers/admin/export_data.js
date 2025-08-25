const exportModel = require('../../Models/admin/export_data.js');

const exportData = async (req, res) => {
    try {
        const { filters, format = 'xlsx' } = req.body;
        
        if (!filters) {
            return res.status(400).json({
                status: false,
                error: "Filters are required"
            });
        }
        
        // Validate format
        if (format !== 'xlsx') {
            return res.status(400).json({
                status: false,
                error: "Only Excel (XLSX) format is supported"
            });
        }
        
        // Generate Excel export
        const excelBuffer = await exportModel.generateExcelExport(filters);
        
        // Set response headers
        const fileName = `project_review_data_export_${new Date().toISOString().split('T')[0]}.xlsx`;
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        
        // Send the Excel file
        res.send(excelBuffer);
        
    } catch (error) {
        console.error("Error exporting data:", error);
        
        if (error.message === 'No data found for the selected filters') {
            return res.status(404).json({
                status: false,
                error: error.message
            });
        }
        
        res.status(500).json({
            status: false,
            error: "Internal server error",
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get available filter options
const getFilterOptions = async (req, res) => {
    try {
        // Get unique semesters
        const semestersQuery = `
            SELECT DISTINCT semester 
            FROM (
                SELECT semester FROM s5_s6_first_review_marks_byguide
                UNION SELECT semester FROM s5_s6_first_review_marks_bysubexpert
                UNION SELECT semester FROM s5_s6_second_review_marks_byguide
                UNION SELECT semester FROM s5_s6_second_review_marks_bysubexpert
                UNION SELECT semester FROM s5_s6_optional_first_review_marks_byguide
                UNION SELECT semester FROM s5_s6_optional_first_review_marks_bysubexpert
                UNION SELECT semester FROM s5_s6_optional_second_review_marks_byguide
                UNION SELECT semester FROM s5_s6_optional_second_review_marks_bysubexpert
                UNION SELECT semester FROM s5_s6_challenge_first_review_marks_bypmc1
                UNION SELECT semester FROM s5_s6_challenge_first_review_marks_bypmc2
                UNION SELECT semester FROM s5_s6_challenge_second_review_marks_bypmc1
                UNION SELECT semester FROM s5_s6_challenge_second_review_marks_bypmc2
                UNION SELECT semester FROM s7_first_review_marks_byguide
                UNION SELECT semester FROM s7_first_review_marks_bysubexpert
                UNION SELECT semester FROM s7_second_review_marks_byguide
                UNION SELECT semester FROM s7_second_review_marks_bysubexpert
                UNION SELECT semester FROM s7_optional_first_review_marks_byguide
                UNION SELECT semester FROM s7_optional_first_review_marks_bysubexpert
                UNION SELECT semester FROM s7_optional_second_review_marks_byguide
                UNION SELECT semester FROM s7_optional_second_review_marks_bysubexpert
                UNION SELECT semester FROM s7_challenge_first_review_marks_bypmc1
                UNION SELECT semester FROM s7_challenge_first_review_marks_bypmc2
                UNION SELECT semester FROM s7_challenge_second_review_marks_bypmc1
                UNION SELECT semester FROM s7_challenge_second_review_marks_bypmc2
            ) AS all_semesters 
            ORDER BY semester
        `;
        
        // Get unique teams
        const teamsQuery = `
            SELECT DISTINCT team_id 
            FROM (
                SELECT team_id FROM s5_s6_first_review_marks_byguide
                UNION SELECT team_id FROM s5_s6_first_review_marks_bysubexpert
                UNION SELECT team_id FROM s5_s6_second_review_marks_byguide
                UNION SELECT team_id FROM s5_s6_second_review_marks_bysubexpert
                UNION SELECT team_id FROM s5_s6_optional_first_review_marks_byguide
                UNION SELECT team_id FROM s5_s6_optional_first_review_marks_bysubexpert
                UNION SELECT team_id FROM s5_s6_optional_second_review_marks_byguide
                UNION SELECT team_id FROM s5_s6_optional_second_review_marks_bysubexpert
                UNION SELECT team_id FROM s5_s6_challenge_first_review_marks_bypmc1
                UNION SELECT team_id FROM s5_s6_challenge_first_review_marks_bypmc2
                UNION SELECT team_id FROM s5_s6_challenge_second_review_marks_bypmc1
                UNION SELECT team_id FROM s5_s6_challenge_second_review_marks_bypmc2
                UNION SELECT team_id FROM s7_first_review_marks_byguide
                UNION SELECT team_id FROM s7_first_review_marks_bysubexpert
                UNION SELECT team_id FROM s7_second_review_marks_byguide
                UNION SELECT team_id FROM s7_second_review_marks_bysubexpert
                UNION SELECT team_id FROM s7_optional_first_review_marks_byguide
                UNION SELECT team_id FROM s7_optional_first_review_marks_bysubexpert
                UNION SELECT team_id FROM s7_optional_second_review_marks_byguide
                UNION SELECT team_id FROM s7_optional_second_review_marks_bysubexpert
                UNION SELECT team_id FROM s7_challenge_first_review_marks_bypmc1
                UNION SELECT team_id FROM s7_challenge_first_review_marks_bypmc2
                UNION SELECT team_id FROM s7_challenge_second_review_marks_bypmc1
                UNION SELECT team_id FROM s7_challenge_second_review_marks_bypmc2
            ) AS all_teams 
            ORDER BY team_id
        `;
        
        const [semesters, teams] = await Promise.all([
            dbQuery(semestersQuery),
            dbQuery(teamsQuery)
        ]);
        
        res.json({
            status: true,
            data: {
                semesters: semesters.map(s => s.semester),
                teams: teams.map(t => t.team_id),
                reviewTypes: ['first', 'second'],
                reviewModes: ['regular', 'optional', 'challenge'],
                evaluatorTypes: ['guide', 'sub_expert', 'pmc1', 'pmc2'],
                attendanceStatuses: ['present', 'absent']
            }
        });
        
    } catch (error) {
        console.error("Error getting filter options:", error);
        res.status(500).json({
            status: false,
            error: "Internal server error"
        });
    }
};

module.exports = {
    exportData,
    getFilterOptions
};