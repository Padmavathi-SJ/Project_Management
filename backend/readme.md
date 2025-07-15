```

mysql> select * from sub_expert_review_schedules;
+--------------+--------------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+-----------+---------------------+
| review_id    | sub_expert_reg_num | team_id   | project_id | review_type | venue      | date       | time     | meeting_link                                               | status    | created_at          |
+--------------+--------------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+-----------+---------------------+
| REV-1039f8a4 | STF-004            | TEAM-0009 | P0005      | review-1    | SF block   | 2025-07-15 | 21:02:00 | https://chatgpt.com/c/686df702-09e0-800b-a574-a60f152f30e3 | Completed | 2025-07-15 09:02:35 |
| REV-117bf1dc | STF-001            | TEAM-0015 | P0007      | review-1    | Mech block | 2025-07-16 | 12:12:00 | https://chatgpt.com/c/686df702-09e0-800b-a574-a60f152f30e3 | Completed | 2025-07-15 12:12:15 |
| REV-c0159276 | STF-004            | TEAM-0009 | P0005      | review-2    | AS block   | 2025-07-16 | 21:03:00 | https://chatgpt.com/c/686df702-09e0-800b-a574-a60f152f30e3 | Completed | 2025-07-15 09:03:50 |
+--------------+--------------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+-----------+---------------------+
3 rows in set (0.00 sec)

mysql> select * from guide_review_schedules;
+--------------+---------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+---------------------+-----------+
| review_id    | guide_reg_num | team_id   | project_id | review_type | venue      | date       | time     | meeting_link                                               | created_at          | status    |
+--------------+---------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+---------------------+-----------+
| REV-75ae9cf1 | STF-004       | TEAM-0015 | P0007      | review-1    | Mech block | 2025-07-15 | 11:19:00 | https://chatgpt.com/c/686df702-09e0-800b-a574-a60f152f30e3 | 2025-07-15 11:19:38 | Completed |
| REV-7ed7c4bc | STF-004       | TEAM-0007 | P0004      | review-2    | AS         | 2025-07-16 | 11:24:00 | http://localhost:5000/api/guide/STF-004/schedule           | 2025-07-13 11:25:03 | Completed |
| REV-897f258b | STF-004       | TEAM-0007 | P0004      | review-1    | SF         | 2025-07-22 | 23:07:00 | http://localhost:5000/api/guide/STF-004/schedule           | 2025-07-13 11:18:54 | Completed |
+--------------+---------------+-----------+------------+-------------+------------+------------+----------+------------------------------------------------------------+---------------------+-----------+
3 rows in set (0.01 sec)

const db = require('../../db.js');

const get_average_marks = async (student_reg_num, team_id, semester, review_type) => {
    try {
        // Determine the correct tables based on review type
        const guideTable = review_type === 'review-1' 
            ? 's5_s6_first_review_marks_byguide' 
            : 's5_s6_second_review_marks_byguide';
        
        const subExpertTable = review_type === 'review-1'
            ? 's5_s6_first_review_marks_bysubexpert'
            : 's5_s6_second_review_marks_bysubexpert';

        // Query to get guide marks
        const guideQuery = `
            SELECT total_marks 
            FROM ${guideTable}
            WHERE student_reg_num = ? 
            AND team_id = ?
            AND semester = ?
            AND review_type = ?
        `;
        
        // Query to get sub-expert marks
        const subExpertQuery = `
            SELECT total_marks 
            FROM ${subExpertTable}
            WHERE student_reg_num = ? 
            AND team_id = ?
            AND semester = ?
            AND review_type = ?
        `;

        // Execute both queries in parallel
        const [guideResults, subExpertResults] = await Promise.all([
            new Promise((resolve, reject) => {
                db.query(guideQuery, [student_reg_num, team_id, semester, review_type], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            }),
            new Promise((resolve, reject) => {
                db.query(subExpertQuery, [student_reg_num, team_id, semester, review_type], (err, result) => {
                    if (err) return reject(err);
                    resolve(result);
                });
            })
        ]);

        // Calculate average if both marks exist
        if (guideResults.length > 0 && subExpertResults.length > 0) {
            const guideMarks = guideResults[0].total_marks;
            const subExpertMarks = subExpertResults[0].total_marks;
            return (guideMarks + subExpertMarks) / 2;
        }

        // Return null if marks aren't available from both evaluators
        return null;
        
    } catch (error) {
        console.error("Error calculating average marks:", error);
        throw error;
    }
};

module.exports = {
    get_average_marks
};

const { get_average_marks } = require('../../Models/student/review_marks.js');

const fetch_average_marks = async (req, res) => {
    const { student_reg_num, team_id } = req.params;
    const { semester, review_type } = req.query;

    if (!student_reg_num || !team_id || !semester || !review_type) {
        return res.status(400).json({
            status: false,
            error: "Missing required parameters"
        });
    }

    try {
        const averageMarks = await get_average_marks(
            student_reg_num, 
            team_id, 
            semester, 
            review_type
        );

        return res.json({
            status: true,
            average_marks: averageMarks
        });
        
    } catch (error) {
        console.error("Error fetching average marks:", error);
        return res.status(500).json({
            status: false,
            error: "Failed to calculate average marks"
        });
    }
};

module.exports = {
    fetch_average_marks
};


write a component called student_review_progress to display review details ---> team_id, student_reg_num, review_type, status, awarded_marks.
--> get team_id, review_type, status from the above tables, and status will be completed --> if review-1 is marked as completed by both guide and sub_expert.
--> you can verify like for a team_id, if review-1 is schedules by both guide and sub_expert --> then check if review-1 is marked as completed by both --> then you get awarded marks .
--> fetch status and display.
--> I have written model and controller to calculate marks.
--> you write model and controller to fetch team_id, review_type, status based on 
```