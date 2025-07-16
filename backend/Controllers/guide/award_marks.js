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

const getTeamMembers = async (req, res) => {
    try {
        const { team_id } = req.params;
        
        if (!team_id || typeof team_id !== 'string' || team_id.trim() === '') {
            return res.status(400).json({
                success: false,
                message: 'Invalid team ID provided'
            });
        }

        const teamMembers = await get_team_members(team_id);

        if (!teamMembers || teamMembers.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Team not found or has no members'
            });
        }

        return res.status(200).json({
            success: true,
            data: teamMembers
        });

    } catch (error) {
        console.error('Error fetching team members:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
};

const submit_marks = async (req, res) => {
    const { semester, review_type, user_type, student_reg_num, attendance } = req.body;
    const { team_id } = req.params;
    const reg_num = req.params.reg_num; // Assuming reg_num comes from authenticated user

    try {
        // Validate required fields
        const requiredFields = {
            semester,
            review_type,
            user_type,
            student_reg_num,
            attendance
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

        // Validate basic field values
        if (!['present', 'absent'].includes(attendance)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid attendance value'
            });
        }

        if (!['5', '6', '7'].includes(semester)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid semester'
            });
        }

        if (!['review-1', 'review-2'].includes(review_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid review type'
            });
        }

        if (!['guide', 'sub_expert'].includes(user_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid user type'
            });
        }

        // Only validate marks if student is present
        if (attendance === 'present') {
            if (!req.body.marks) {
                return res.status(400).json({
                    status: false,
                    error: 'Marks are required when attendance is present'
                });
            }

            const validationErrors = validateMarks(req.body.marks, review_type, semester, attendance);
            if (validationErrors) {
                return res.status(400).json({
                    status: false,
                    error: 'Invalid marks data',
                    details: validationErrors
                });
            }
        }

        // Prepare data for insertion
        const studentData = {
            student_reg_num,
            review_type,
            team_id,
            semester,
            attendance,
            marks: req.body.marks || {} // Empty object if absent
        };

        // Set evaluator registration number
        if (user_type === 'guide') {
            studentData.guide_reg_num = reg_num;
        } else {
            studentData.sub_expert_reg_num = reg_num;
        }

        // Determine which insert function to use
        let insertionResult;
        if (semester === '5' || semester === '6') {
            if (review_type === 'review-1') {
                insertionResult = user_type === 'guide'
                    ? await insert_s56_first_review_by_guide(studentData)
                    : await insert_s56_first_review_by_subexpert(studentData);
            } else {
                insertionResult = user_type === 'guide'
                    ? await insert_s56_second_review_by_guide(studentData)
                    : await insert_s56_second_review_by_subexpert(studentData);
            }
        } else { // Semester 7
            if (review_type === 'review-1') {
                insertionResult = user_type === 'guide'
                    ? await insert_s7_first_review_by_guide(studentData)
                    : await insert_s7_first_review_by_subexpert(studentData);
            } else {
                insertionResult = user_type === 'guide'
                    ? await insert_s7_second_review_by_guide(studentData)
                    : await insert_s7_second_review_by_subexpert(studentData);
            }
        }

        return res.status(200).json({
            status: true,
            message: attendance === 'absent' 
                ? 'Absence recorded successfully' 
                : 'Marks submitted successfully',
            data: {
                id: insertionResult.insertId,
                student_reg_num,
                team_id,
                semester,
                review_type,
                attendance
            }
        });

    } catch (error) {
        console.error("Error submitting marks:", error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                error: "Marks already submitted for this student",
                details: error.message
            });
        }

        return res.status(500).json({
            status: false,
            error: "Internal server error",
            details: error.message
        });
    }
};

module.exports = {
    getTeamMembers,
    submit_marks
};