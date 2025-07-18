import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GuideScheduleReview from './schedule_review.jsx';
import SubExpertScheduleReview from '../Subject_expert/Schedule_review.jsx';

const ReviewScheduling = () => {
  const navigate = useNavigate();
  const [selectedOption, setSelectedOption] = useState(null);

  // Function to handle option selection
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // Function to pass to child components for navigation
  const handleSuccess = () => {
    setSelectedOption(null); // Reset to show options
    navigate('/schedule-review'); // Ensure URL consistency
  };

  // Function to navigate to optional review requests
  const handleOptionalReviews = () => {
    navigate('/guide/optional_review_requests');
  };

  if (selectedOption === 'guide') {
    return (
      <div>
        <button 
          onClick={() => setSelectedOption(null)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ← Back to options
        </button>
        <GuideScheduleReview onSuccess={handleSuccess} />
      </div>
    );
  }

  if (selectedOption === 'subExpert') {
    return (
      <div>
        <button 
          onClick={() => setSelectedOption(null)}
          className="mb-4 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
        >
          ← Back to options
        </button>
        <SubExpertScheduleReview onSuccess={handleSuccess} />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">Schedule Review</h1>
      <div className="space-y-4">
        <div 
          onClick={() => handleOptionSelect('guide')}
          className="p-6 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Schedule Review as Guide</h2>
          <p className="text-gray-600">Schedule reviews for teams you are guiding</p>
        </div>
        
        <div 
          onClick={() => handleOptionSelect('subExpert')}
          className="p-6 border border-gray-300 rounded-lg cursor-pointer hover:bg-purple-50 hover:border-purple-300 transition-colors"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Schedule Review as Sub-Expert</h2>
          <p className="text-gray-600">Schedule reviews for teams you are assigned to as sub-expert</p>
        </div>
        
        <button
          onClick={handleOptionalReviews}
          className="w-full p-4 border border-gray-300 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors text-left"
        >
          <h2 className="text-xl font-semibold text-purple-700 mb-2">Optional Review Requests</h2>
          <p className="text-gray-600">View and manage optional review requests</p>
        </button>
      </div>
    </div>
  );
};

export default ReviewScheduling;