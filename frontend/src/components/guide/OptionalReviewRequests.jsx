import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import instance from '../../utils/axiosInstance';

const OptionalReviewRequests = () => {
  const userRegNum = useSelector((state) => state.userSlice?.reg_num);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [activeRequest, setActiveRequest] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [userType, setUserType] = useState(null);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await instance.get(
          `/api/guide/optional_review_requests/${userRegNum}`
        );

        if (response.data && response.data.status === true) {
          setRequests(response.data.data || []);
          setUserType(response.data.userType);
        } else {
          throw new Error(response.data?.error || 'Invalid response from server');
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message || "Failed to load requests";
        setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
      } finally {
        setLoading(false);
      }
    };

    if (userRegNum) {
      fetchRequests();
    }
  }, [userRegNum]);

  const handleAction = async (requestId, action) => {
    try {
      setActionLoading(true);
      setError(null);
      
      if (action === 'reject' && !rejectionReason) {
        setError('Please provide a rejection reason');
        return;
      }

      const response = await instance.patch(
        `/api/guide/optional_review_requests/${requestId}/status`,
        {
          status: action === 'accept' ? 'approved' : 'rejected',
          rejection_reason: action === 'reject' ? rejectionReason : null
        }
      );

      if (response.data && response.data.status === true) {
        const message = response.data.message || `Request ${action === 'accept' ? 'approved' : 'rejected'} successfully!`;
        setSuccessMessage(typeof message === 'string' ? message : JSON.stringify(message));
        
        setRequests(prevRequests => 
          prevRequests.map(req => 
            req.request_id === requestId ? 
            response.data.updatedRequest : 
            req
          )
        );
        
        setActiveRequest(null);
        setRejectionReason('');
        setTimeout(() => setSuccessMessage(null), 3000);
      } else {
        throw new Error(response.data?.error || 'Update failed');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message || "Failed to update request";
      setError(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-solid"></div>
        <p className="mt-4 text-gray-600">Loading optional review requests...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="bg-red-50 p-4 rounded border border-red-200">
          <h3 className="text-red-700 font-medium">Error Loading Requests</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!userType) {
    return (
      <div className="p-6 max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <h3 className="text-blue-700 font-medium">No Requests Found</h3>
          <p className="text-blue-600 mt-1">You don't have any optional review requests assigned.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-purple-700">
        {userType === 'guide' ? 'Guide' : 'Sub-Expert'} Optional Review Requests
      </h1>
      
      {successMessage && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4 rounded">
          <p className="font-bold">Success</p>
          <p>{successMessage}</p>
        </div>
      )}

      {requests.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-blue-800">No pending optional review requests found.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
          >
            Refresh
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">
              {requests.length} Pending Request{requests.length !== 1 ? 's' : ''}
            </h2>
          </div>
          
          <div className="space-y-4">
            {requests.map(request => (
              <div key={request.request_id} className="bg-white shadow rounded-lg p-4 border border-gray-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="font-semibold">Team ID:</p>
                    <p className="text-gray-700">{request.team_id}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Project ID:</p>
                    <p className="text-gray-700">{request.project_id}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Semester:</p>
                    <p className="text-gray-700">Semester {request.semester}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Review Type:</p>
                    <p className="text-gray-700">
                      {request.review_type === 'review-1' ? 'First Review' : 
                       request.review_type === 'review-2' ? 'Second Review' : 
                       request.review_type}
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold">Student:</p>
                    <p className="text-gray-700">{request.student_reg_num}</p>
                  </div>
                  <div>
                    <p className="font-semibold">Status:</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      request.request_status === 'approved' ? 'bg-green-100 text-green-800' :
                      request.request_status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {request.request_status}
                    </span>
                  </div>
                </div>
                
                <div className="mb-4">
                  <p className="font-semibold">Request Reason:</p>
                  <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded">
                    {request.request_reason}
                  </p>
                </div>

                {request.request_status === 'pending' && (
                  <div className="mt-4 space-y-3">
                    {activeRequest === request.request_id ? (
                      <div className="space-y-3">
                        <div className="flex space-x-3">
                          <button
                            onClick={() => handleAction(request.request_id, 'accept')}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                            disabled={actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Confirm Accept'}
                          </button>
                          <button
                            onClick={() => setActiveRequest(null)}
                            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                            disabled={actionLoading}
                          >
                            Cancel
                          </button>
                        </div>
                        
                        <div className="mt-2">
                          <label className="block font-medium mb-1">Rejection Reason:</label>
                          <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            placeholder="Provide reason for rejection..."
                            disabled={actionLoading}
                          />
                          <button
                            onClick={() => handleAction(request.request_id, 'reject')}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 mt-2 disabled:bg-red-300"
                            disabled={!rejectionReason || actionLoading}
                          >
                            {actionLoading ? 'Processing...' : 'Confirm Reject'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setActiveRequest(request.request_id)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Take Action
                      </button>
                    )}
                  </div>
                )}

                {request.request_status === 'rejected' && request.rejection_reason && (
                  <div className="mt-4 p-3 bg-red-50 rounded-md">
                    <p className="font-semibold text-red-800">Rejection Reason:</p>
                    <p className="text-red-700 whitespace-pre-line">{request.rejection_reason}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default OptionalReviewRequests;