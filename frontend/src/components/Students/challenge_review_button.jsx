import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';

const ChallengeReviewButton = () => {
  const user = useSelector((state) => state.userSlice);
  const navigate = useNavigate();
  
  const [eligibility, setEligibility] = useState({
    status: 'checking', // 'checking', 'eligible', 'ineligible'
    message: '',
    semester: null,
    enabledReviewTypes: [] // Track which review types are enabled
  });

  useEffect(() => {
    if (user?.reg_num) {
      checkEligibility();
    }
  }, [user?.reg_num]);

  const checkEligibility = async () => {
    setEligibility(prev => ({...prev, status: 'checking'}));
    
    try {
      // 1. First check which review types are enabled
      const enabledTypesRes = await axiosInstance.get('/api/challenge-reviews/enabled-review-types');
      const enabledTypes = enabledTypesRes.data.enabledReviewTypes || [];
      
      if (enabledTypes.length === 0) {
        setEligibility({
          status: 'ineligible',
          message: '',
          semester: null,
          enabledReviewTypes: []
        });
        return;
      }

      // 2. Get semester
      const semesterRes = await axiosInstance.get(`/api/challenge-reviews/semester/${user.reg_num}`);
      if (!semesterRes.data.success) throw new Error(semesterRes.data.message);
      
      const studentSemester = semesterRes.data.semester;

      // 3. Check eligibility for each enabled review type
      let isEligible = false;
      
      // Check each enabled review type until we find one the student is eligible for
      for (const reviewType of enabledTypes) {
        try {
          const eligibilityRes = await axiosInstance.get(
            `/api/challenge-reviews/eligibility/${user.reg_num}/${studentSemester}/${reviewType}`
          );
          
          if (eligibilityRes.data.isEligible) {
            isEligible = true;
            break;
          }
        } catch (err) {
          console.error(`Error checking eligibility for ${reviewType}:`, err);
        }
      }

      if (isEligible) {
        setEligibility({
          status: 'eligible',
          message: '',
          semester: studentSemester,
          enabledReviewTypes: enabledTypes
        });
      } else {
        setEligibility({
          status: 'ineligible',
          message: '',
          semester: studentSemester,
          enabledReviewTypes: enabledTypes
        });
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setEligibility({
        status: 'ineligible',
        message: '',
        semester: null,
        enabledReviewTypes: []
      });
    }
  };

  const handleApply = () => {
    if (!eligibility.semester || eligibility.enabledReviewTypes.length === 0) return;
    
    // If only one review type is enabled, pass it directly
    const reviewType = eligibility.enabledReviewTypes.length === 1 
      ? eligibility.enabledReviewTypes[0]
      : null;
    
    navigate(`/student/apply_challenge_review/${user.reg_num}`, {
      state: { 
        semester: eligibility.semester,
        reviewType // Pass the review type if only one is enabled
      }
    });
  };

  // Loading state
  if (eligibility.status === 'checking') {
    return (
      <div className="absolute top-4 right-4 p-2 text-sm text-gray-600">
        Checking eligibility...
      </div>
    );
  }

  // Only show button if eligible, otherwise show nothing
  if (eligibility.status === 'eligible') {
    return (
      <div className="absolute top-4 right-4">
        <button
          onClick={handleApply}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
        >
          Apply Challenge Review
        </button>
      </div>
    );
  }

  // For all other cases (ineligible, disabled, etc.), return null (show nothing)
  return null;
};

export default ChallengeReviewButton;