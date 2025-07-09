import React, { useState, useEffect } from 'react';
import { useSelector } from "react-redux";
import instance from '../../utils/axiosInstance';
import { setLogLevel } from 'firebase/app';
import { Users, Check, ClipboardList, MessageCircle, Bell } from 'lucide-react';

const SubjectExpertDashboard = () => {
  const [invitations, setInvitations] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const selector = useSelector((Store) => Store.userSlice);
  const [selectedReview, setSelectedReview] = useState(null); // store the selected review to accept
  const [venueInput, setVenueInput] = useState("");       
  const [mentoredTeams, setMentoredTeams] = useState([]);


  function formatDateOnly(date) {
    const d = new Date(date);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  // Fetch team invitations
  async function fetchInvitations() {
    try {
      const response = await instance.get(`/expert/getrequests/${selector.reg_num}`);
      if (response.status === 200 && Array.isArray(response.data)) {
        setInvitations(response.data);
      } else {
        setInvitations([]);
        console.warn("Expected array but got:", response.data);
      }
    } catch (error) {
      alert("ERROR occurred while fetching the invitations!");
      console.error(error);
      setInvitations([]);
    }
  }

  const [loading, setLoading] = useState(false);

useEffect(() => {
    const fetchReviewRequests = async () => {
      try {
        const response = await instance.get(`/sub_exp/fetch_mentoring_teams/${userSlice.reg_num}`);
        if (Array.isArray(response.data)) {
          setReviewRequests(response.data);console.log(response.data);
          
        } else {
          setReviewRequests([]);
        }
      } catch (error) {
        console.log("Error fetching review requests",error);
        console.error(error);
      }
    };

    fetchReviewRequests();
  }, [selector.reg_num]);



  // Fetch review requests
  async function fetchReviewRequests() {
    try {
      const response = await instance.get(`/sub_expert/fetch_review_requests/${selector.reg_num}`);
      if (response.status === 200 && Array.isArray(response.data)) {

        setReviewRequests(response.data);
      } else {
        setReviewRequests([]);
        console.warn("Expected array but got:", response.data);
      }
    } catch (error) {
      alert("ERROR while fetching review requests!");
      console.error(error);
      setReviewRequests([]);
    }
  }


  async function name(params) {
    
  }

  useEffect(() => {
    fetchInvitations();
    fetchReviewRequests();
  }, []);

  // Accept invitation
  const handleAccept = async (teamId) => {
    try {
      const response = await instance.patch(`/sub_expert/accept_reject/accept/${teamId}/${selector.reg_num}`);
      if (response.status === 200) {
        alert(`${teamId} accepted!`);
        setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
      }
    } catch (error) {
      alert("Failed to accept invitation.");
      console.error(error);
    }
  };

  // Reject invitation
  const handleReject = async (teamId) => {
    try {
      const response = await instance.patch(`/sub_expert/accept_reject/reject/${teamId}/${selector.reg_num}`);
      if (response.status === 200) {
        alert(`${teamId} rejected!`);
        setInvitations(prev => prev.filter(invite => invite.from_team_id !== teamId));
      }
    } catch (error) {
      alert("Failed to reject invitation.");
      console.error(error);
    }
  };

  // Single function for accepting/rejecting reviews
  const handleReview = async (status, req) => {
    if (status === "accept") {
      // First step: Show input field
      setSelectedReview(req);  // store the request to be accepted
    } else if (status === "reject") {
      // Directly reject as before
      try {
        const url = `/sub_expert/add_review_details/${req.request_id}/${status}/${selector.reg_num}/${req.team_id}`;
        const new_review_date = formatDateOnly(req.review_date);
        const payload = {
          project_id: req.project_id,
          project_name: req.project_name,
          team_lead: req.team_lead,
          review_date: new_review_date,
          start_time: req.start_time,
          venue: "Biw",
          request_id: req.request_id,
          status: status
        };
        const response = await instance.post(url, payload);
        if (response.status === 200) {
          alert(`Review request ${req.request_id} rejected.`);
          setReviewRequests(prev => prev.filter(r => r.request_id !== req.request_id));
        }
      } catch (error) {
        alert("Something went wrong while rejecting.");
        console.error(error);
      }
    }
  };
  ;

  const handleConfirmAccept = async () => {
    if (!venueInput || !selectedReview) {
      alert("Please enter venue.");
      return;
    }

    try {
      const req = selectedReview;
      const url = `/sub_expert/add_review_details/${req.request_id}/accept/${selector.reg_num}/${req.team_id}`;
      const new_review_date = formatDateOnly(req.review_date);
      const payload = {
        project_id: req.project_id,
        project_name: req.project_name,
        team_lead: req.team_lead,
        review_date: new_review_date,
        start_time: req.start_time,
        venue: venueInput,
        request_id: req.request_id,
        status: "accept",
      };

      const response = await instance.post(url, payload);
      if (response.status === 200) {
        alert(`Review for ${req.project_name} accepted and scheduled!`);
        setReviewRequests(prev => prev.filter(r => r.request_id !== req.request_id));
        setSelectedReview(null); // clear selection
        setVenueInput(""); // clear input
      }
    } catch (error) {
      alert("Something went wrong during confirmation.");
      console.error(error);
    }
  };


  const handleClose = () => {
    setShowPopup(false);
  };

  return (
    <div className="p-10">
      {/* Header */}
      <div className="flex justify-between mb-3 items-center">
        <h1 className="text-3xl font-semibold text-center flex-1">Dashboard</h1>
        <div className="relative ml-auto">
          <button
            onClick={() => setShowPopup(true)}
            className="p-2 rounded-full transition"
          >
            <Bell className="w-6 h-6 text-black" />
            {(invitations.length > 0 || reviewRequests.length > 0) && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            )}
          </button>
        </div>
      </div>
<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10'>
      <Card icon={<Users className="text-purple-600 bg-white" size={32} />} label="Assigned Teams" value={mentoredTeams.length} />
        <Card icon={<ClipboardList className="text-green-600 bg-white" size={32} />} label="Ongoing Projects" value={mentoredTeams.length} />
        <Card icon={<Check className="text-green-500 bg-white" size={32} />} label="Completed Project Teams" value={Math.floor(mentoredTeams.length / 2)} />
</div>

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center">
          <div className="relative w-full max-w-xl mx-4 bg-white rounded-2xl shadow-2xl p-6 animate-fade-in">
            <button
              onClick={handleClose}
              className="absolute top-3 right-4 text-gray-400 hover:text-red-500 text-2xl"
              aria-label="Close"
            >
              &times;
            </button>

            <h2 className="text-3xl font-bold bg-white text-center text-gray-800 mb-6">Notifications</h2>

            {(invitations.length === 0 && reviewRequests.length === 0) ? (
              <p className="text-center bg-white text-gray-500">No notifications at the moment.</p>
            ) : (
              <div className="space-y-8 bg-white max-h-[70vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-purple-300">

                {/* Team Invitations */}
                {invitations.length > 0 && (
                  <div className='rounded-xl'>
                    <div className="space-y-4 rounded-xl bg-white">
                      {invitations.map((invite) => (
                        <div key={`invite-${invite.from_team_id}`} className="p-4 bg-white rounded-xl border border-purple-200 shadow-sm">
                          <p className=" bg-white font-semibold text-gray-800">Team: {invite.from_team_id}</p>
                          <p className=" bg-white text-gray-600">Project: {invite.project_name}</p>
                          <div className="flex bg-white justify-end gap-3 mt-3">
                            <button
                              onClick={() => handleAccept(invite.from_team_id)}
                              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-1.5 rounded-lg text-sm"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleReject(invite.from_team_id)}
                              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Review Requests */}
                {reviewRequests.map((req) => (
                  <div key={`review-${req.request_id}`} className="p-4 rounded-xl border bg-white shadow-sm">
                    <p className="font-semibold bg-white text-gray-800">Project: {req.project_name}</p>
                    <p className="text-gray-600 bg-white">Lead: {req.team_lead}</p>
                    <p className="text-gray-600 bg-white">Date: {req.review_date}</p>
                    <p className="text-gray-600 bg-white">Time: {req.start_time}</p>

                    {/* Conditionally render venue input */}
                    {selectedReview?.request_id === req.request_id ? (
                      <div className="mt-2 bg-white">
                        <input
                          type="text"
                          placeholder="Enter venue"
                          value={venueInput}
                          onChange={(e) => setVenueInput(e.target.value)}
                          className="border px-3 py-1 bg-white rounded w-full mb-2"
                        />
                        <button
                          onClick={handleConfirmAccept}
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Confirm Accept
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end bg-white gap-3 mt-3">
                        <button
                          onClick={() => handleReview('accept', req)}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReview('reject', req)}
                          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg text-sm"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}


              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};

const Card = ({ icon, label, value }) => (
  <div className="flex items-center bg-white shadow-md rounded-2xl p-4 space-x-4">
    <div className="p-2 rounded-full bg-white">{icon}</div>
    <div>
      <p className="text-sm text-gray-600 bg-white">{label}</p>
      <p className="text-2xl font-bold text-gray-800 bg-white">{value}</p>
    </div>
  </div>
);

export default SubjectExpertDashboard;