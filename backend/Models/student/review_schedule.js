const db = require('../../db.js');

// Get regular review schedules by team ID
const get_regular_reviews_by_team = (team_id) => {
    const query = `
        SELECT 
            review_id,
            guide_reg_num,
            sub_expert_reg_num,
            team_id,
            project_id,
            semester,
            review_type,
            review_mode,
            venue,
            Date as date,
            start_time,
            end_time,
            meeting_link,
            created_at,
            guide_review_status,
            sub_expert_review_status
        FROM regular_review_schedules 
        WHERE team_id = ?
        ORDER BY Date, start_time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

// Get regular review schedules by team ID with user details
const get_regular_reviews_with_details = (team_id) => {
    const query = `
        SELECT 
            rrs.*,
            g.name as guide_name,
            g.emailId as guide_email,
            se.name as sub_expert_name,
            se.emailId as sub_expert_email
        FROM regular_review_schedules rrs
        LEFT JOIN users g ON rrs.guide_reg_num = g.reg_num
        LEFT JOIN users se ON rrs.sub_expert_reg_num = se.reg_num
        WHERE rrs.team_id = ?
        ORDER BY rrs.Date, rrs.start_time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

// Get upcoming regular reviews for a team
const get_upcoming_regular_reviews = (team_id) => {
    const query = `
        SELECT 
            review_id,
            guide_reg_num,
            sub_expert_reg_num,
            team_id,
            project_id,
            semester,
            review_type,
            review_mode,
            venue,
            Date as date,
            start_time,
            end_time,
            meeting_link,
            guide_review_status,
            sub_expert_review_status
        FROM regular_review_schedules 
        WHERE team_id = ? 
        AND (Date > CURDATE() OR (Date = CURDATE() AND end_time > CURTIME()))
        AND guide_review_status != 'Completed'
        AND sub_expert_review_status != 'Completed'
        ORDER BY Date, start_time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

// Get upcoming regular reviews with user details
const get_upcoming_regular_reviews_with_details = (team_id) => {
    const query = `
        SELECT 
            rrs.*,
            g.name as guide_name,
            g.emailId as guide_email,
            se.name as sub_expert_name,
            se.emailId as sub_expert_email
        FROM regular_review_schedules rrs
        LEFT JOIN users g ON rrs.guide_reg_num = g.reg_num
        LEFT JOIN users se ON rrs.sub_expert_reg_num = se.reg_num
        WHERE rrs.team_id = ? 
        AND (rrs.Date > CURDATE() OR (rrs.Date = CURDATE() AND rrs.end_time > CURTIME()))
        AND rrs.guide_review_status != 'Completed'
        AND rrs.sub_expert_review_status != 'Completed'
        ORDER BY rrs.Date, rrs.start_time
    `;
    
    return new Promise((resolve, reject) => {
        db.query(query, [team_id], (err, result) => {
            if (err) return reject(err);
            return resolve(result);
        });
    });
};

module.exports = {
    get_regular_reviews_by_team,
    get_regular_reviews_with_details,
    get_upcoming_regular_reviews,
    get_upcoming_regular_reviews_with_details
};