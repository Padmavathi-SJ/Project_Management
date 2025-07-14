const {
    get_team_members,
    validateMarks,
    insert_s56_first_review_by_guide,
    insert_s56_first_review_by_subexpert,
    insert_s56_second_review_by_guide,
    insert_s56_second_review_by_subexpert,
    insert_s7_first_review_by_guide,
    insert_s7_first_review_by_subexpert,
    insert_s7_second_review_by_guide,
    insert_s7_second_review_by_subexpert
} = require('../../Models/guide/award_marks.js');

const submit_marks = async (req, res) => {
    const { semester, review_type, user_type, student_reg_num } = req.body;
    const { team_id } = req.params;
    const reg_num = req.params.reg_num;

    try {
        // Validate required fields
        const requiredFields = {
            semester,
            review_type,
            user_type,
            team_id,
            student_reg_num,
            marks: req.body.marks
        };

        const missingFields = Object.entries(requiredFields)
            .filter(([_, value]) => value === undefined || value === null)
            .map(([field]) => field);

        if (missingFields.length > 0) {
            return res.status(400).json({
                status: false,
                error: 'Missing required fields',
                missing_fields: missingFields
            });
        }

        // Validate semester
        if (!['5', '6', '7'].includes(semester)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid semester',
                allowed_values: ['5', '6', '7']
            });
        }

        // Validate review type
        if (!['review-1', 'review-2'].includes(review_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid review type',
                allowed_values: ['review-1', 'review-2']
            });
        }

        // Validate user type
        if (!['guide', 'sub_expert'].includes(user_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid user type',
                allowed_values: ['guide', 'sub_expert']
            });
        }

        // Validate marks structure
        const validationErrors = validateMarks(req.body.marks, review_type, semester);
        if (validationErrors) {
            return res.status(400).json({
                status: false,
                error: 'Invalid marks data',
                details: validationErrors
            });
        }

        // Prepare student data
        const studentData = {
            student_reg_num,
            team_id,
            semester,
            ...req.body.marks
        };

        // Set appropriate registration number
        if (user_type === 'guide') {
            studentData.guide_reg_num = reg_num;
        } else {
            studentData.sub_expert_reg_num = reg_num;
        }

        // Insert into appropriate table
        let result;
        try {
            if (semester === '5' || semester === '6') {
                if (review_type === 'review-1') {
                    result = user_type === 'guide'
                        ? await insert_s56_first_review_by_guide(studentData)
                        : await insert_s56_first_review_by_subexpert(studentData);
                } else {
                    result = user_type === 'guide'
                        ? await insert_s56_second_review_by_guide(studentData)
                        : await insert_s56_second_review_by_subexpert(studentData);
                }
            } else { // Semester 7
                if (review_type === 'review-1') {
                    result = user_type === 'guide'
                        ? await insert_s7_first_review_by_guide(studentData)
                        : await insert_s7_first_review_by_subexpert(studentData);
                } else {
                    result = user_type === 'guide'
                        ? await insert_s7_second_review_by_guide(studentData)
                        : await insert_s7_second_review_by_subexpert(studentData);
                }
            }

            return res.json({
                status: true,
                message: 'Marks submitted successfully',
                data: {
                    student_reg_num,
                    team_id,
                    semester,
                    review_type,
                    inserted_id: result.insertId
                }
            });

        } catch (dbError) {
            console.error("Database insertion error:", dbError);
            return res.status(500).json({
                status: false,
                error: "Failed to insert marks",
                details: dbError.message,
                sql: dbError.sql
            });
        }

    } catch (error) {
        console.error("Error submitting marks:", error);
        return res.status(500).json({
            status: false,
            error: "Internal server error",
            details: error.message
        });
    }
};

module.exports = {
    submit_marks
};