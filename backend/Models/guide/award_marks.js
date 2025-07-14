const db = require('../../db.js');

const get_team_members = (team_id) => {
    const query = `
        SELECT reg_num AS student_reg_num
        FROM teams
        WHERE team_id = ?
    `;
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

// Validate marks before insertion
const validateMarks = (marks, reviewType, semester) => {
    const errors = [];
    
    // Common validations for all reviews
    if (!marks.attendance || !['present', 'absent'].includes(marks.attendance)) {
        errors.push('Attendance must be "present" or "absent"');
    }

    // Semester 5/6 Validations
    if (semester === '5' || semester === '6') {
        if (reviewType === 'review-1') {
            const fieldRanges = {
                'literature_review': 5,
                'Aim_Objective_of_the_project': 5,
                'Scope_of_the_project': 5,
                'Need_for_the_current_study': 5,
                'Proposed_Methodology': 10,
                'Project_work_Plan': 5,
                'Oral_Presentation': 5,
                'Viva_Voce_PPT': 5,
                'Contributions_to_the_work_and_worklog': 5
            };
            
            for (const [field, max] of Object.entries(fieldRanges)) {
                const value = marks[field];
                if (value === undefined || value === null) {
                    errors.push(`${field} is required`);
                } else if (isNaN(value)) {
                    errors.push(`${field} must be a number`);
                } else if (value < 0 || value > max) {
                    errors.push(`${field} must be between 0 and ${max}`);
                }
            }
            // Validate total marks don't exceed maximum
            const totalMarks = Object.values(fieldRanges).reduce((a, b) => a + b, 0);
            const submittedTotal = Object.keys(fieldRanges)
                .reduce((sum, field) => sum + (parseInt(marks[field]) || 0), 0);
            
            if (submittedTotal > totalMarks) {
                errors.push(`Total marks cannot exceed ${totalMarks}`);
            }
        } 
        else if (reviewType === 'review-2') {
            const fieldRanges = {
                'designs': 5,
                'novelty_of_the_project_partial_completion_of_report': 5,
                'analysis_of_results_and_discussions': 10,
                'originality_score_for_final_project_report': 5,
                'oral_presentation': 10,
                'viva_voce_ppt': 10,
                'contributions_to_the_work_and_worklog': 5
            };
            
            for (const [field, max] of Object.entries(fieldRanges)) {
                const value = marks[field];
                if (value === undefined || value === null) {
                    errors.push(`${field} is required`);
                } else if (isNaN(value)) {
                    errors.push(`${field} must be a number`);
                } else if (value < 0 || value > max) {
                    errors.push(`${field} must be between 0 and ${max}`);
                }
            }
            // Validate total marks don't exceed maximum
            const totalMarks = Object.values(fieldRanges).reduce((a, b) => a + b, 0);
            const submittedTotal = Object.keys(fieldRanges)
                .reduce((sum, field) => sum + (parseInt(marks[field]) || 0), 0);
            
            if (submittedTotal > totalMarks) {
                errors.push(`Total marks cannot exceed ${totalMarks}`);
            }
        }
    }
    // Semester 7 Validations
    else if (semester === '7') {
        if (reviewType === 'review-1') {
            const fieldRanges = {
                'literature_review': 10,
                'aim_objective_of_the_project': 5,
                'scope_of_the_project': 5,
                'need_for_the_current_study': 5,
                'feasibility_analysis': 5,
                'proposed_methodology': 20,
                'choice_of_components_modules_equipment': 10,
                'designs_hardware_software_architecture': 20,
                'novelty_of_the_project_partial_completion': 15,
                'oral_presentation': 10,
                'viva_voce': 10,
                'contribution_to_the_work_and_worklog': 10
            };
            
            for (const [field, max] of Object.entries(fieldRanges)) {
                const value = marks[field];
                if (value === undefined || value === null) {
                    errors.push(`${field} is required`);
                } else if (isNaN(value)) {
                    errors.push(`${field} must be a number`);
                } else if (value < 0 || value > max) {
                    errors.push(`${field} must be between 0 and ${max}`);
                }
            }
            // Validate total marks don't exceed maximum
            const totalMarks = Object.values(fieldRanges).reduce((a, b) => a + b, 0);
            const submittedTotal = Object.keys(fieldRanges)
                .reduce((sum, field) => sum + (parseInt(marks[field]) || 0), 0);
            
            if (submittedTotal > totalMarks) {
                errors.push(`Total marks cannot exceed ${totalMarks}`);
            }
        } 
        else if (reviewType === 'review-2') {
            const fieldRanges = {
                'project_work_plan': 10,
                'effective_utilization_of_modern_tools': 10,
                'analysis_of_results_and_discussion': 30,
                'cost_benefit_analysis': 5,
                'publications_conference_journal_patent': 15,
                'originality_score_for_final_project_report': 10,
                'oral_presentation': 15,
                'viva_voce': 15,
                'contributions_to_the_work_and_worklog': 15
            };
            
            for (const [field, max] of Object.entries(fieldRanges)) {
                const value = marks[field];
                if (value === undefined || value === null) {
                    errors.push(`${field} is required`);
                } else if (isNaN(value)) {
                    errors.push(`${field} must be a number`);
                } else if (value < 0 || value > max) {
                    errors.push(`${field} must be between 0 and ${max}`);
                }
            }
            // Validate total marks don't exceed maximum
            const totalMarks = Object.values(fieldRanges).reduce((a, b) => a + b, 0);
            const submittedTotal = Object.keys(fieldRanges)
                .reduce((sum, field) => sum + (parseInt(marks[field]) || 0), 0);
            
            if (submittedTotal > totalMarks) {
                errors.push(`Total marks cannot exceed ${totalMarks}`);
            }

            // Special validation for publications field
            if (marks.publications_conference_journal_patent && 
                marks.publications_conference_journal_patent.length > 255) {
                errors.push('Publications field must be less than 255 characters');
            }
        }
    }

    return errors.length ? errors : null;
};

// Semester 5/6 First Review
const insert_s56_first_review_by_guide = (data) => {
    const query = `INSERT INTO s5_s6_first_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const insert_s56_first_review_by_subexpert = (data) => {
    const query = `INSERT INTO s5_s6_first_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

// Semester 5/6 Second Review
const insert_s56_second_review_by_guide = (data) => {
    const query = `INSERT INTO s5_s6_second_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const insert_s56_second_review_by_subexpert = (data) => {
    const query = `INSERT INTO s5_s6_second_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

// Semester 7 First Review
const insert_s7_first_review_by_guide = (data) => {
    const query = `INSERT INTO s7_first_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const insert_s7_first_review_by_subexpert = (data) => {
    const query = `INSERT INTO s7_first_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

// Semester 7 Second Review
const insert_s7_second_review_by_guide = (data) => {
    const query = `INSERT INTO s7_second_review_marks_byguide SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

const insert_s7_second_review_by_subexpert = (data) => {
    const query = `INSERT INTO s7_second_review_marks_bysubexpert SET ?`;
    return new Promise((resolve, reject) => {
        db.query(query, [data], (err, result) => {
            if(err) return reject(err);
            return resolve(result);
        });
    });
};

module.exports = {
    get_team_members,
    insert_s56_first_review_by_guide,
    insert_s56_first_review_by_subexpert,
    insert_s56_second_review_by_guide,
    insert_s56_second_review_by_subexpert,
    insert_s7_first_review_by_guide,
    insert_s7_first_review_by_subexpert,
    insert_s7_second_review_by_guide,
    insert_s7_second_review_by_subexpert,
    validateMarks
};