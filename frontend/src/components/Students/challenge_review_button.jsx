import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axiosInstance from '../../utils/axiosInstance';

const ChallengeReviewButton = () => {
  const user = useSelector((state) => state.userSlice);
  const navigate = useNavigate();
  
  const [isEligible, setIsEligible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [semester, setSemester] = useState(null);

  useEffect(() => {
    if (user?.reg_num) {
      fetchSemesterAndCheckEligibility();
    }
  }, [user?.reg_num]);

  const fetchSemesterAndCheckEligibility = async () => {
    if (!user?.reg_num) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // First fetch the semester
      const semesterResponse = await axiosInstance.get(
        `/api/challenge-reviews/semester/${user.reg_num}`
      );
      
      if (!semesterResponse.data.success) {
        throw new Error(semesterResponse.data.message || 'Failed to fetch semester');
      }
      
      const studentSemester = semesterResponse.data.semester;
      setSemester(studentSemester);

      // Then check eligibility
      const eligibilityResponse = await axiosInstance.get(
        `/api/challenge-reviews/eligibility/${user.reg_num}/${studentSemester}`
      );
      
      setIsEligible(eligibilityResponse.data.isEligible);
      if (eligibilityResponse.data.error) {
        setError(eligibilityResponse.data.error);
      }
    } catch (err) {
      console.error('Error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.response?.data?.error || 
                         err.message || 
                         'Failed to check eligibility';
      setError(errorMessage);
      setIsEligible(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    if (!semester) {
      setError('Semester information not available');
      return;
    }
    
    navigate(`/student/apply_challenge_review/${user.reg_num}`, {
      state: { semester }
    });
  };

  if (!isEligible && !isLoading) return null;

  return (
    <div className="absolute top-4 right-4">
      <button
        onClick={handleClick}
        disabled={isLoading || !isEligible || !semester}
        className={`px-4 py-2 rounded-md text-white ${
          isEligible && semester
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-gray-400 cursor-not-allowed'
        } focus:outline-none focus:ring-2 focus:ring-green-500`}
      >
        {isLoading ? 'Checking...' : 'Apply Challenge Review'}
      </button>
      
      {error && (
        <div className="mt-2 text-xs text-red-500">
          {error}
        </div>
      )}
    </div>
  );
};

export default ChallengeReviewButton;