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
    semester: null
  });

  useEffect(() => {
    if (user?.reg_num) {
      checkEligibility();
    }
  }, [user?.reg_num]);

  const checkEligibility = async () => {
    setEligibility(prev => ({...prev, status: 'checking'}));
    
    try {
      // 1. Get semester first
      const semesterRes = await axiosInstance.get(`/api/challenge-reviews/semester/${user.reg_num}`);
      if (!semesterRes.data.success) throw new Error(semesterRes.data.message);
      
      const studentSemester = semesterRes.data.semester;

      // 2. Check eligibility
      const eligibilityRes = await axiosInstance.get(
        `/api/challenge-reviews/eligibility/${user.reg_num}/${studentSemester}`
      );
      
      if (eligibilityRes.data.isEligible) {
        setEligibility({
          status: 'eligible',
          message: '',
          semester: studentSemester
        });
      } else {
        setEligibility({
          status: 'ineligible',
          message: eligibilityRes.data.error || "Not eligible for challenge review",
          semester: studentSemester
        });
      }
    } catch (err) {
      console.error('Error checking eligibility:', err);
      setEligibility({
        status: 'ineligible',
        message: err.response?.data?.error || err.message || "Failed to check eligibility",
        semester: null
      });
    }
  };

  const handleApply = () => {
    if (!eligibility.semester) return;
    navigate(`/student/apply_challenge_review/${user.reg_num}`, {
      state: { semester: eligibility.semester }
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

  /*
  // Already submitted case
  if (eligibility.status === 'ineligible' && 
      eligibility.message.includes("already submitted")) {
    return (
      <div className="absolute top-4 right-4 p-2 text-sm text-red-500">
        You've already submitted a challenge review request
      </div>
    );
  }

  
  // Other ineligible cases
  if (eligibility.status === 'ineligible') {
    return (
      <div className="absolute top-4 right-4 p-2 text-sm text-red-500">
        {eligibility.message}
      </div>
    );
  }
*/
  // Only show button if eligible
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

  return null;
};

export default ChallengeReviewButton;