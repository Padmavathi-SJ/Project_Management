const db = require('../../db');
const XLSX = require('xlsx');

// Helper function for promise-based db queries
const dbQuery = (query, params) => {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, result) => {
            if (err) return reject(err);
            resolve(result);
        });
    });
};

// Get table names based on filters
const getTableNames = (filters) => {
    const tables = [];
    const semesters = filters.semester && filters.semester.length > 0 ? filters.semester : ['5', '6', '7'];
    const reviewTypes = filters.reviewType && filters.reviewType.length > 0 ? filters.reviewType : ['first', 'second'];
    const reviewModes = filters.reviewMode && filters.reviewMode.length > 0 ? filters.reviewMode : ['regular', 'optional', 'challenge'];

    semesters.forEach(semester => {
        reviewTypes.forEach(reviewType => {
            reviewModes.forEach(reviewMode => {
                const prefix = semester === '7' ? 's7' : 's5_s6';
                const review = reviewType === 'first' ? 'first_review' : 'second_review';
                
                if (reviewMode === 'challenge') {
                    tables.push(`${prefix}_challenge_${review}_marks_bypmc1`);
                    tables.push(`${prefix}_challenge_${review}_marks_bypmc2`);
                } else if (reviewMode === 'optional') {
                    tables.push(`${prefix}_optional_${review}_marks_byguide`);
                    tables.push(`${prefix}_optional_${review}_marks_bysubexpert`);
                } else {
                    tables.push(`${prefix}_${review}_marks_byguide`);
                    tables.push(`${prefix}_${review}_marks_bysubexpert`);
                }
            });
        });
    });

    return tables;
};

// Build the main export query
const buildExportQuery = (filters) => {
    const tables = getTableNames(filters);
    let unionQueries = [];
    let params = [];
    let paramIndex = 0;

    tables.forEach(table => {
        let tableQuery = `
            SELECT 
                '${table}' as source_table,
                team_id,
                student_reg_num,
                semester,
                review_type,
                ${table.includes('challenge') ? "'challenge'" : table.includes('optional') ? "'optional'" : "'regular'"} as review_mode,
                ${table.includes('byguide') ? "'guide'" : table.includes('bysubexpert') ? "'sub_expert'" : table.includes('bypmc1') ? "'pmc1'" : "'pmc2'"} as evaluator_type,
                attendance,
                total_marks,
                evaluation_date,
                comments
            FROM ${table}
            WHERE 1=1
        `;

        // Add filters
        if (filters.dateRange && filters.dateRange.from) {
            tableQuery += ` AND evaluation_date >= ?`;
            params.push(filters.dateRange.from);
            paramIndex++;
        }
        
        if (filters.dateRange && filters.dateRange.to) {
            tableQuery += ` AND evaluation_date <= ?`;
            params.push(filters.dateRange.to);
            paramIndex++;
        }
        
        if (filters.teamId) {
            tableQuery += ` AND team_id = ?`;
            params.push(filters.teamId);
            paramIndex++;
        }
        
        if (filters.studentRegNum) {
            tableQuery += ` AND student_reg_num = ?`;
            params.push(filters.studentRegNum);
            paramIndex++;
        }
        
        if (filters.attendanceStatus) {
            tableQuery += ` AND attendance = ?`;
            params.push(filters.attendanceStatus);
            paramIndex++;
        }
        
        if (filters.marksRange && filters.marksRange.min) {
            tableQuery += ` AND total_marks >= ?`;
            params.push(parseFloat(filters.marksRange.min));
            paramIndex++;
        }
        
        if (filters.marksRange && filters.marksRange.max) {
            tableQuery += ` AND total_marks <= ?`;
            params.push(parseFloat(filters.marksRange.max));
            paramIndex++;
        }

        unionQueries.push(tableQuery);
    });

    const mainQuery = unionQueries.join(' UNION ALL ') + ' ORDER BY evaluation_date DESC, team_id, student_reg_num';

    return {
        query: mainQuery,
        params: params
    };
};

// Get additional team and student details
const getTeamStudentDetails = async (teamIds, studentRegNums) => {
    let teamQuery = `
        SELECT t.team_id, t.team_name, t.project_title, 
               u.name as guide_name, u.email as guide_email,
               d.name as department_name
        FROM teams t
        LEFT JOIN users u ON t.guide_id = u.user_id
        LEFT JOIN department_clusters d ON t.department_cluster_id = d.cluster_id
    `;
    
    let studentQuery = `
        SELECT s.student_reg_num, s.student_name, s.email as student_email,
               d.name as department_name
        FROM users s
        LEFT JOIN department_clusters d ON s.department_cluster_id = d.cluster_id
    `;
    
    let teamParams = [];
    let studentParams = [];
    
    if (teamIds && teamIds.length > 0) {
        teamQuery += ` WHERE t.team_id IN (${teamIds.map(() => '?').join(',')})`;
        teamParams = teamIds;
    }
    
    if (studentRegNums && studentRegNums.length > 0) {
        studentQuery += ` WHERE s.student_reg_num IN (${studentRegNums.map(() => '?').join(',')})`;
        studentParams = studentRegNums;
    }
    
    const [teams, students] = await Promise.all([
        dbQuery(teamQuery, teamParams),
        dbQuery(studentQuery, studentParams)
    ]);
    
    return { teams, students };
};

// Generate Excel file
const generateExcelExport = async (filters) => {
    try {
        // Get the main review data
        const queryInfo = buildExportQuery(filters);
        const reviewData = await dbQuery(queryInfo.query, queryInfo.params);
        
        if (reviewData.length === 0) {
            throw new Error('No data found for the selected filters');
        }
        
        // Extract unique team IDs and student registration numbers
        const teamIds = [...new Set(reviewData.map(item => item.team_id))];
        const studentRegNums = [...new Set(reviewData.map(item => item.student_reg_num))];
        
        // Get additional details
        const { teams, students } = await getTeamStudentDetails(teamIds, studentRegNums);
        
        // Create team and student maps for easy lookup
        const teamMap = new Map(teams.map(team => [team.team_id, team]));
        const studentMap = new Map(students.map(student => [student.student_reg_num, student]));
        
        // Enrich review data with additional details
        const enrichedData = reviewData.map(item => {
            const team = teamMap.get(item.team_id) || {};
            const student = studentMap.get(item.student_reg_num) || {};
            
            return {
                'Team ID': item.team_id,
                'Team Name': team.team_name || 'N/A',
                'Project Title': team.project_title || 'N/A',
                'Student Registration Number': item.student_reg_num,
                'Student Name': student.student_name || 'N/A',
                'Student Email': student.student_email || 'N/A',
                'Department': student.department_name || team.department_name || 'N/A',
                'Semester': item.semester,
                'Review Type': item.review_type === 'review-1' ? 'First Review' : 'Second Review',
                'Review Mode': item.review_mode.charAt(0).toUpperCase() + item.review_mode.slice(1),
                'Evaluator Type': item.evaluator_type.charAt(0).toUpperCase() + item.evaluator_type.slice(1),
                'Attendance': item.attendance.charAt(0).toUpperCase() + item.attendance.slice(1),
                'Total Marks': item.total_marks,
                'Evaluation Date': item.evaluation_date ? new Date(item.evaluation_date).toLocaleDateString() : 'N/A',
                'Comments': item.comments || 'No comments',
                'Guide Name': team.guide_name || 'N/A',
                'Guide Email': team.guide_email || 'N/A'
            };
        });
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        
        // Add main data sheet
        const worksheet = XLSX.utils.json_to_sheet(enrichedData);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Review Data');
        
        // Add summary sheet
        const summaryData = createSummaryData(enrichedData);
        const summarySheet = XLSX.utils.json_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Generate Excel buffer
        const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
        
        return excelBuffer;
    } catch (error) {
        console.error('Error generating Excel export:', error);
        throw error;
    }
};

// Create summary data
const createSummaryData = (enrichedData) => {
    if (enrichedData.length === 0) return [];
    
    const summary = [];
    
    // Total records
    summary.push({ Metric: 'Total Records', Value: enrichedData.length });
    
    // Count by review type
    const reviewTypeCount = enrichedData.reduce((acc, item) => {
        acc[item['Review Type']] = (acc[item['Review Type']] || 0) + 1;
        return acc;
    }, {});
    
    Object.entries(reviewTypeCount).forEach(([type, count]) => {
        summary.push({ Metric: `${type} Records`, Value: count });
    });
    
    // Count by review mode
    const reviewModeCount = enrichedData.reduce((acc, item) => {
        acc[item['Review Mode']] = (acc[item['Review Mode']] || 0) + 1;
        return acc;
    }, {});
    
    Object.entries(reviewModeCount).forEach(([mode, count]) => {
        summary.push({ Metric: `${mode} Review Records`, Value: count });
    });
    
    // Count by attendance
    const attendanceCount = enrichedData.reduce((acc, item) => {
        acc[item['Attendance']] = (acc[item['Attendance']] || 0) + 1;
        return acc;
    }, {});
    
    Object.entries(attendanceCount).forEach(([status, count]) => {
        summary.push({ Metric: `${status} Attendance`, Value: count });
    });
    
    // Average marks
    const presentRecords = enrichedData.filter(item => item['Attendance'] === 'Present');
    if (presentRecords.length > 0) {
        const totalMarks = presentRecords.reduce((sum, item) => sum + (item['Total Marks'] || 0), 0);
        const averageMarks = totalMarks / presentRecords.length;
        summary.push({ Metric: 'Average Marks (Present Only)', Value: averageMarks.toFixed(2) });
    }
    
    // Date range
    const dates = enrichedData.map(item => {
        const dateStr = item['Evaluation Date'];
        return dateStr !== 'N/A' ? new Date(dateStr) : null;
    }).filter(date => date !== null);
    
    if (dates.length > 0) {
        const minDate = new Date(Math.min(...dates));
        const maxDate = new Date(Math.max(...dates));
        summary.push({ Metric: 'Date Range', Value: `${minDate.toLocaleDateString()} to ${maxDate.toLocaleDateString()}` });
    }
    
    return summary;
};

module.exports = {
    generateExcelExport,
    getTableNames,
    buildExportQuery
};