const challengeReviewModel = require('../../Models/common_models/challenge_review.js');
const challengeReviewMarksModel = require('../../Models/common_models/challenge_review_marks.js');
const { validateMarks } = require('../../Models/guide/award_marks.js');

// Submit challenge review marks
const submitChallengeReviewMarks = async (req, res) => {
    const { semester, review_type, user_type, student_reg_num, attendance = 'present' } = req.body;
    const { team_id } = req.params;
    const reg_num = req.params.reg_num; // From authenticated user

    try {
        // Validate required fields
        const requiredFields = {
            semester,
            review_type,
            user_type,
            student_reg_num,
            attendance
        };

         // Only require marks if attendance is present
        if (attendance === 'present') {
            requiredFields.marks = req.body.marks;
        }

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

        // Validate field values
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

        if (!['pmc1', 'pmc2'].includes(user_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid user type'
            });
        }

       // Validate marks structure only if present
        if (attendance === 'present') {
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
           attendance
        };

         // Include marks only if present
        if (attendance === 'present') {
            studentData.marks = req.body.marks;
        }
        
        // Set evaluator registration number
        if (user_type === 'pmc1') {
            studentData.guide_reg_num = reg_num;
        } else {
            studentData.sub_expert_reg_num = reg_num;
        }

        // Determine which insert function to use
        let insertionResult;
        if (semester === '5' || semester === '6') {
            if (review_type === 'review-1') {
                insertionResult = user_type === 'pmc1'
                    ? await challengeReviewMarksModel.insert_s56_challenge_first_review_by_pmc1(studentData)
                    : await challengeReviewMarksModel.insert_s56_challenge_first_review_by_pmc2(studentData);
            } else {
                insertionResult = user_type === 'pmc1'
                    ? await challengeReviewMarksModel.insert_s56_challenge_second_review_by_pmc1(studentData)
                    : await challengeReviewMarksModel.insert_s56_challenge_second_review_by_pmc2(studentData);
            }
        } else { // Semester 7
            if (review_type === 'review-1') {
                insertionResult = user_type === 'pmc1'
                    ? await challengeReviewMarksModel.insert_s7_challenge_first_review_by_pmc1(studentData)
                    : await challengeReviewMarksModel.insert_s7_challenge_first_review_by_pmc2(studentData);
            } else {
                insertionResult = user_type === 'pmc1'
                    ? await challengeReviewMarksModel.insert_s7_challenge_second_review_by_pmc1(studentData)
                    : await challengeReviewMarksModel.insert_s7_challenge_second_review_by_pmc2(studentData);
            }
        }

        return res.status(201).json({
            status: true,
            message: 'Challenge review marks submitted successfully',
            data: {
                id: insertionResult.insertId,
                student_reg_num,
                team_id,
                semester,
                review_type
            }
        });

    } catch (error) {
        console.error("Error submitting challenge review marks:", error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                error: "Challenge review marks already submitted for this student",
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

// Get eligible students who have completed challenge reviews
const getEligibleChallengeStudents = async (req, res) => {
    try {
        const { team_id } = req.params;

        if (!team_id) {
            return res.status(400).json({
                status: false,
                error: 'Team ID is required'
            });
        }

        const completedReviews = await challengeReviewMarksModel.getCompletedChallengeReviews(team_id);

        // Group by student_reg_num
        const studentsMap = new Map();
        completedReviews.forEach(review => {
            if (!studentsMap.has(review.student_reg_num)) {
                studentsMap.set(review.student_reg_num, []);
            }
            studentsMap.get(review.student_reg_num).push({
                semester: review.semester,
                review_type: review.review_type
            });
        });

        // Convert to array format
        const students = Array.from(studentsMap, ([student_reg_num, reviews]) => ({
            student_reg_num,
            reviews
        }));

        res.json({
            status: true,
            data: students
        });

    } catch (error) {
        console.error('Error in getEligibleChallengeStudents:', error);
        res.status(500).json({
            status: false,
            error: 'Internal server error',
            details: error.message
        });
    }
};

module.exports = {
    submitChallengeReviewMarks,
    getEligibleChallengeStudents
};