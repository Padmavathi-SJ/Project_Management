import React, { useState, useEffect } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import NotificationPopup from '../../components/Students/NotificationPopup';

const ChallengeReviewAssignment = () => {
  const [assignmentStatus, setAssignmentStatus] = useState(null);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [availableStaff, setAvailableStaff] = useState([]);
  const [selectedCluster, setSelectedCluster] = useState('');
  const [batchSize, setBatchSize] = useState(5);
  const [loading, setLoading] = useState({
    status: true,
    requests: false,
    staff: false,
    assigning: false
  });
  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  // Fetch initial assignment status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await axiosInstance.get('/api/admin/status');
        setAssignmentStatus(response.data);
        if (response.data.clusterStats.length > 0) {
          setSelectedCluster(response.data.clusterStats[0].cluster);
        }
      } catch (error) {
        showNotification('Failed to load assignment status', 'error');
      } finally {
        setLoading(prev => ({ ...prev, status: false }));
      }
    };
    
    fetchStatus();
  }, []);

  // Fetch pending requests when cluster changes
  useEffect(() => {
    if (!selectedCluster) return;
    
    const fetchPendingRequests = async () => {
      setLoading(prev => ({ ...prev, requests: true }));
      try {
        const response = await axiosInstance.get(`/api/admin/cluster-requests/${selectedCluster}`);
        setPendingRequests(response.data.requests);
      } catch (error) {
        showNotification('Failed to load pending requests', 'error');
      } finally {
        setLoading(prev => ({ ...prev, requests: false }));
      }
    };
    
    fetchPendingRequests();
  }, [selectedCluster]);

  // Fetch available staff when cluster changes
  useEffect(() => {
    if (!selectedCluster) return;
    
    const fetchAvailableStaff = async () => {
      setLoading(prev => ({ ...prev, staff: true }));
      try {
        const response = await axiosInstance.get(`/api/admin/cluster-staff/${selectedCluster}`);
        setAvailableStaff(response.data.staff);
      } catch (error) {
        showNotification('Failed to load available staff', 'error');
      } finally {
        setLoading(prev => ({ ...prev, staff: false }));
      }
    };
    
    fetchAvailableStaff();
  }, [selectedCluster]);

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  const handleAssignReviewers = async () => {
    if (!selectedCluster || !batchSize) {
      showNotification('Please select a cluster and batch size', 'error');
      return;
    }

    setLoading(prev => ({ ...prev, assigning: true }));
    try {
      const response = await axiosInstance.post('/api/admin/assign', {
        cluster: selectedCluster,
        batchSize
      });

      showNotification(response.data.message, 'success');
      
      // Refresh data
      const statusResponse = await axiosInstance.get('/api/admin/status');
      setAssignmentStatus(statusResponse.data);
      
      const requestsResponse = await axiosInstance.get(`/api/admin/cluster-requests/${selectedCluster}`);
      setPendingRequests(requestsResponse.data.requests);
      
      const staffResponse = await axiosInstance.get(`/api/admin/cluster-staff/${selectedCluster}`);
      setAvailableStaff(staffResponse.data.staff);

    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to assign reviewers';
      showNotification(errorMessage, 'error');
      
      // If there are remaining requests, suggest using that as batch size
      if (error.response?.data?.remainingRequests) {
        const confirm = window.confirm(
          `There are ${error.response.data.remainingRequests} remaining requests. Would you like to use this as the batch size?`
        );
        if (confirm) {
          setBatchSize(error.response.data.remainingRequests);
        }
      }
    } finally {
      setLoading(prev => ({ ...prev, assigning: false }));
    }
  };

  const handleBatchSizeChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    setBatchSize(value > 0 ? value : 1);
  };

  if (loading.status) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignmentStatus) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 text-center max-w-md mx-auto mt-10">
        <p className="text-red-500 font-medium">Failed to load assignment data. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {notification.show && (
        <NotificationPopup
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(prev => ({ ...prev, show: false }))}
        />
      )}

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Challenge Review Assignment</h1>
        <p className="text-gray-600">Manage and assign reviewers to pending challenge review requests</p>
      </div>
      
      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Status Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Current Status</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Review Type:</span>
              <span className="font-medium">{assignmentStatus.enabledReviewType || 'None'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Requests:</span>
              <span className="font-medium">{assignmentStatus.totalPendingRequests}</span>
            </div>
          </div>
        </div>

        {/* Cluster Selection Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-indigo-50 text-indigo-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Select Cluster</h2>
          </div>
          <div className="space-y-4">
            <select
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedCluster}
              onChange={(e) => setSelectedCluster(e.target.value)}
              disabled={loading.requests || loading.staff}
            >
              {assignmentStatus.clusterStats.map((cluster) => (
                <option key={cluster.cluster} value={cluster.cluster}>
                  {cluster.cluster} ({cluster.pendingRequests} pending)
                </option>
              ))}
            </select>
            
            {selectedCluster && (
              <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                <h3 className="font-medium text-gray-700 mb-1">Cluster Details</h3>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-medium">{pendingRequests.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Available Staff:</span>
                  <span className="font-medium">{availableStaff.length}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Assignment Card */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Assignment Controls</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Batch Size (Requests per Reviewer Pair)
              </label>
              <input
                type="number"
                min="1"
                max={pendingRequests.length}
                value={batchSize}
                onChange={handleBatchSizeChange}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading.assigning}
              />
              <p className="text-xs text-gray-500 mt-1">
                {pendingRequests.length > 0 
                  ? `Assign ${batchSize} requests to one reviewer pair (1-${pendingRequests.length})`
                  : 'No pending requests available'}
              </p>
            </div>
            
            <button
              onClick={handleAssignReviewers}
              disabled={loading.assigning || pendingRequests.length === 0}
              className={`w-full py-2 px-4 rounded-md text-white font-medium transition-colors ${
                loading.assigning || pendingRequests.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
              }`}
            >
              {loading.assigning ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Assigning...
                </span>
              ) : 'Assign Reviewers'}
            </button>
          </div>
        </div>
      </div>

      {/* Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Requests Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Pending Requests</h2>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {pendingRequests.length} requests
            </span>
          </div>
          {loading.requests ? (
            <div className="p-6 text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : pendingRequests.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Project
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pendingRequests.map((request) => (
                    <tr key={request.request_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {request.student_reg_num}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.team_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {request.project_id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no pending requests for this cluster.</p>
            </div>
          )}
        </div>

        {/* Available Staff Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Available Staff</h2>
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {availableStaff.length} staff
            </span>
          </div>
          {loading.staff ? (
            <div className="p-6 text-center">
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : availableStaff.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {availableStaff.map((staff) => (
                    <tr key={staff.reg_num} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {staff.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{staff.name}</div>
                            <div className="text-sm text-gray-500">{staff.reg_num}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          {staff.designation}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {staff.dept}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No available staff</h3>
              <p className="mt-1 text-sm text-gray-500">There are currently no available staff members for this cluster.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChallengeReviewAssignment;