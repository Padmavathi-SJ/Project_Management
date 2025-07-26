import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const ChallengeReviewAssignment = () => {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [ratio, setRatio] = useState({ students: 5, reviewers: 1 });
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedReviewType, setSelectedReviewType] = useState('review-1');
  const [remainingRequests, setRemainingRequests] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    title: '',
    message: '',
    isSuccess: false,
    assignments: []
  });

  // Fetch statistics on component mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/challenge-review-assignment/statistics');
        setStats(response.data.data);
        
        const remaining = {};
        response.data.data.forEach(dept => {
          remaining[dept.dept] = {
            'review-1': dept.review1,
            'review-2': dept.review2
          };
        });
        setRemainingRequests(remaining);
      } catch (error) {
        toast.error('Failed to load statistics: ' + error.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const handleAssignReviewers = async () => {
    if (!selectedDept) {
      toast.error('Please select a department');
      return;
    }

    setAssigning(true);
    try {
      const response = await axiosInstance.post('/api/admin/challenge-review-assignment/assign', {
        dept: selectedDept,
        review_type: selectedReviewType,
        ratio
      });

      // Set modal content for success
      setModalContent({
        title: 'Assignment Successful',
        message: `Successfully assigned reviewers to ${response.data.data.assignments.length} requests`,
        isSuccess: true,
        assignments: response.data.data.assignments
      });
      setShowModal(true);

      // Update remaining requests count
      setRemainingRequests(prev => ({
        ...prev,
        [selectedDept]: {
          ...prev[selectedDept],
          [selectedReviewType]: prev[selectedDept][selectedReviewType] - response.data.data.assignments.length
        }
      }));

      // Refresh statistics
      const statsResponse = await axiosInstance.get('/api/admin/challenge-review-assignment/statistics');
      setStats(statsResponse.data.data);
    } catch (error) {
      console.error('Assignment error:', error.response?.data);
      
      // Handle balance case
      if (error.response?.data?.error?.includes('balance')) {
        const balance = error.response.data.error.match(/\d+/)?.[0];
        if (balance) {
          if (window.confirm(`${balance} requests remaining. Would you like to assign with ratio ${balance}:1?`)) {
            setRatio({ students: parseInt(balance), reviewers: 1 });
            return; // Let user submit again with new ratio
          }
        }
      }
      
      // Set modal content for error
      setModalContent({
        title: 'Assignment Failed',
        message: error.response?.data?.message || 'Failed to assign reviewers',
        isSuccess: false,
        assignments: []
      });
      setShowModal(true);
    } finally {
      setAssigning(false);
    }
  };

  const handleRatioChange = (e) => {
    const { name, value } = e.target;
    setRatio(prev => ({
      ...prev,
      [name]: parseInt(value) || 0
    }));
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Challenge Review Assignment</h1>
      
      {/* Simple Modal Implementation */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-lg shadow-xl max-w-md w-full p-6 ${
            modalContent.isSuccess ? 'border-l-4 border-green-500' : 'border-l-4 border-red-500'
          }`}>
            <h2 className={`text-xl font-bold mb-4 ${
              modalContent.isSuccess ? 'text-green-700' : 'text-red-700'
            }`}>
              {modalContent.isSuccess ? '✅ ' : '❌ '}{modalContent.title}
            </h2>
            <p className="mb-4">{modalContent.message}</p>
            
            {modalContent.isSuccess && modalContent.assignments.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold mb-2">Assignments Made:</h3>
                <div className="max-h-60 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PMC1</th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">PMC2</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {modalContent.assignments.map((assignment, index) => (
                        <tr key={index}>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{assignment.student_reg_num}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{assignment.pmc1_reg_num}</td>
                          <td className="px-3 py-2 whitespace-nowrap text-sm">{assignment.pmc2_reg_num}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            <div className="flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className={`px-4 py-2 rounded text-white ${
                  modalContent.isSuccess ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center">Loading statistics...</div>
      ) : (
        <>
          {/* Statistics Table */}
          <div className="mb-8 bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review 1 Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review 2 Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Requests</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available Staff</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.map((dept) => (
                  <tr key={dept.dept} 
                      className={`hover:bg-gray-50 cursor-pointer ${selectedDept === dept.dept ? 'bg-blue-50' : ''}`}
                      onClick={() => setSelectedDept(dept.dept)}>
                    <td className="px-6 py-4 whitespace-nowrap font-medium">{dept.dept}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.review1}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.review2}</td>
                    <td className="px-6 py-4 whitespace-nowrap font-bold">{dept.total}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{dept.staffCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Assignment Controls */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Assign Reviewers</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selected Department</label>
                  <div className="p-2 border rounded bg-gray-50">
                    {selectedDept || 'None selected'}
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Review Type</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedReviewType}
                    onChange={(e) => setSelectedReviewType(e.target.value)}
                  >
                    <option value="review-1">Review 1</option>
                    <option value="review-2">Review 2</option>
                  </select>
                </div>
                
                {selectedDept && remainingRequests[selectedDept] && (
                  <div className="mb-4 p-3 bg-blue-50 rounded">
                    <p className="font-medium">Remaining Requests:</p>
                    <p>Review 1: {remainingRequests[selectedDept]['review-1']}</p>
                    <p>Review 2: {remainingRequests[selectedDept]['review-2']}</p>
                  </div>
                )}
              </div>
              
              <div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assignment Ratio</label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="mr-2">Students:</span>
                      <input
                        type="number"
                        name="students"
                        value={ratio.students}
                        onChange={handleRatioChange}
                        min="1"
                        className="w-16 p-2 border rounded"
                      />
                    </div>
                    <span>:</span>
                    <div className="flex items-center">
                      <span className="mr-2">Reviewers:</span>
                      <input
                        type="number"
                        name="reviewers"
                        value={ratio.reviewers}
                        onChange={handleRatioChange}
                        min="1"
                        className="w-16 p-2 border rounded"
                      />
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Example: 5:1 means 5 students will be assigned to 1 PMC1 and 1 PMC2
                  </p>
                </div>
                
                <div className="mt-6">
                  <button
                    onClick={handleAssignReviewers}
                    disabled={assigning || !selectedDept}
                    className={`px-4 py-2 rounded text-white ${assigning || !selectedDept ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                  >
                    {assigning ? 'Assigning...' : 'Assign Reviewers'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChallengeReviewAssignment;