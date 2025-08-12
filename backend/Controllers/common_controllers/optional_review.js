const {
    getRequestDetailsById,
    getSubExpertFromTeam,
    scheduleOptionalReview,
     getGuideReviews,
  getSubExpertReviews,
  checkUserRole,
    insert_s56_optional_first_review_by_guide,
    insert_s56_optional_first_review_by_subexpert,
    insert_s56_optional_second_review_by_guide,
    insert_s56_optional_second_review_by_subexpert,
    insert_s7_optional_first_review_by_guide,
    insert_s7_optional_first_review_by_subexpert,
    insert_s7_optional_second_review_by_guide,
    insert_s7_optional_second_review_by_subexpert,
    getCompletedOptionalReviewStudents
} = require('../../Models/common_models/optional_review.js');
 const {validateMarks} = require('../../Models/guide/award_marks.js');

const submitOptionalReviewMarks = async (req, res) => {
    const { semester, review_type, user_type, student_reg_num } = req.body;
    const { team_id } = req.params;
    const reg_num = req.params.reg_num; // From authenticated user

    try {
        // Validate required fields
        const requiredFields = {
            semester,
            review_type,
            user_type,
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

        if (!['guide', 'sub_expert'].includes(user_type)) {
            return res.status(400).json({
                status: false,
                error: 'Invalid user type'
            });
        }

        // Validate marks structure
        const validationErrors = validateMarks(req.body.marks, review_type, semester, 'present');
        if (validationErrors) {
            return res.status(400).json({
                status: false,
                error: 'Invalid marks data',
                details: validationErrors
            });
        }

        // Prepare data for insertion
        const studentData = {
            student_reg_num,
            review_type,
            team_id,
            semester,
            marks: req.body.marks
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
                    ? await insert_s56_optional_first_review_by_guide(studentData)
                    : await insert_s56_optional_first_review_by_subexpert(studentData);
            } else {
                insertionResult = user_type === 'guide'
                    ? await insert_s56_optional_second_review_by_guide(studentData)
                    : await insert_s56_optional_second_review_by_subexpert(studentData);
            }
        } else { // Semester 7
            if (review_type === 'review-1') {
                insertionResult = user_type === 'guide'
                    ? await insert_s7_optional_first_review_by_guide(studentData)
                    : await insert_s7_optional_first_review_by_subexpert(studentData);
            } else {
                insertionResult = user_type === 'guide'
                    ? await insert_s7_optional_second_review_by_guide(studentData)
                    : await insert_s7_optional_second_review_by_subexpert(studentData);
            }
        }

        return res.status(201).json({
            status: true,
            message: 'Optional review marks submitted successfully',
            data: {
                id: insertionResult.insertId,
                student_reg_num,
                team_id,
                semester,
                review_type
            }
        });

    } catch (error) {
        console.error("Error submitting optional review marks:", error);
        
        // Handle duplicate entry error
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({
                status: false,
                error: "Optional review marks already submitted for this student",
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


const scheduleReview = async (req, res) => {
  try {
    const { user_reg_num } = req.params;
    const { request_id, review_mode, venue, date, start_time, end_time, meeting_link } = req.body;

    // Debug: Log incoming values
    console.log('Received values:', {
      user_reg_num,
      request_id,
      review_mode,
      date,
      start_time,
      end_time
    });

    // Validate required fields - check for empty strings too
    if (!user_reg_num || user_reg_num.trim() === '' ||
        !request_id || request_id.toString().trim() === '' ||
        !date || date.trim() === '' ||
        !start_time || start_time.trim() === '' ||
        !end_time || end_time.trim() === '' ||
        !review_mode || review_mode.trim() === '') {
      return res.status(400).json({
        status: false,
        error: "All fields are required: guide registration number, request ID, date, start time, end time, and review mode"
      });
    }

    // Get request details
    const request = await getRequestDetailsById(request_id);
    if (!request) {
      return res.status(404).json({
        status: false,
        error: "Request not found or not approved"
      });
    }

    // Validate the guide from request matches the guide in URL
    if (request.guide_reg_num !== user_reg_num) {
      return res.status(403).json({
        status: false,
        error: "You are not authorized to schedule this review"
      });
    }

    // Validate review mode specific fields
    if (review_mode === 'online' && (!meeting_link || meeting_link.trim() === '')) {
      return res.status(400).json({
        status: false,
        error: "Meeting link is required for online reviews"
      });
    }

    if (review_mode === 'offline' && (!venue || venue.trim() === '')) {
      return res.status(400).json({
        status: false,
        error: "Venue is required for offline reviews"
      });
    }

    // Prepare review data
    const reviewData = {
      review_id: `OR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      student_reg_num: request.student_reg_num,
      guide_reg_num: user_reg_num,
      sub_expert_reg_num: request.sub_expert_reg_num,
      team_id: request.team_id,
      project_id: request.project_id,
      semester: request.semester,
      review_type: request.review_type,
      review_mode,
      venue: review_mode === 'offline' ? venue : null,
      date,
      start_time,
      end_time,
      meeting_link: review_mode === 'online' ? meeting_link : null,
      request_id
    };

    // Schedule the review
    await scheduleOptionalReview(reviewData);

    return res.json({
      status: true,
      message: "Review scheduled successfully",
      data: reviewData
    });

  } catch (error) {
    console.error("Error scheduling review:", error);
    return res.status(500).json({
      status: false,
      error: error.message || "Internal server error"
    });
  }
};


const getOptionalReviews = async (req, res) => {
  try {
    const { user_reg_num } = req.params;

    if (!user_reg_num) {
      return res.status(400).json({
        status: false,
        error: "User registration number is required"
      });
    }

    const role = await checkUserRole(user_reg_num);

    if (!role) {
      return res.status(404).json({
        status: false,
        error: "No reviews found for this user"
      });
    }

    let reviews;
    if (role === 'guide') {
      reviews = await getGuideReviews(user_reg_num);
    } else {
      reviews = await getSubExpertReviews(user_reg_num);
    }

    if (reviews.length === 0) {
      return res.status(404).json({
        status: false,
        error: "No reviews found for this user"
      });
    }

    return res.json({
      status: true,
      user_type: role,
      data: reviews
    });

  } catch (error) {
    console.error("Error fetching optional reviews:", error);
    return res.status(500).json({
      status: false,
      error: "Internal server error"
    });
  }
};


const getEligibleStudents = async (req, res) => {
  try {
    const { team_id } = req.params;

    if (!team_id) {
      return res.status(400).json({
        status: false,
        error: 'Team ID is required'
      });
    }

    const completedReviews = await getCompletedOptionalReviewStudents(team_id);

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
    console.error('Error in getEligibleStudents:', error);
    res.status(500).json({
      status: false,
      error: 'Internal server error',
      details: error.message
    });
  }
};


module.exports = {
    scheduleReview,
    getOptionalReviews,
    submitOptionalReviewMarks,
    getEligibleStudents
}