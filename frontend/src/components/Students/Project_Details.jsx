import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';

// Constants
const MAX_SELECTION = 4; // Maximum allowed selections for guides/experts

// Helper component: Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

// Helper component: Readonly project details display
const ProjectDetailsView = ({ project }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow space-y-8">
      {/* Project details display remains the same */}
      <div className="grid grid-cols-2 gap-6">
        <div className="flex justify-between">
          <span className="font-semibold">Project Name:</span>
          <span>{project.project_name}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Cluster:</span>
          <span>{project.cluster}</span>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6">
        <div className="flex justify-between">
          <span className="font-semibold">Project Type:</span>
          <span>{project.hard_soft}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-semibold">Internal/External:</span>
          <span>{project.project_type}</span>
        </div>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Description:</h3>
        <p className="text-gray-700">{project.description}</p>
      </div>
      <div>
        <h3 className="font-semibold mb-1">Expected Outcome:</h3>
        <p className="text-gray-700">{project.outcome}</p>
      </div>
    </div>
  );
};

const Project_Details = () => {
  // Redux state
  const userselector = useSelector((State) => State.userSlice);
  const teamselector = useSelector((State) => State.teamSlice);
  const teamstatusselector = useSelector((State) => State.teamStatusSlice);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [clusterName, setClusterName] = useState('');
  const [core, setCore] = useState('');
  const [description, setDescription] = useState('');
  const [outcome, setOutcome] = useState('');

  // Staff selection state
  const [expertsList, setExpertsList] = useState([]);
  const [guidesList, setGuidesList] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const navigate = useNavigate();

  // Get unique departments for cluster dropdown
  const uniqueDepartments = [...new Set(
    teamselector
      .filter(team => Boolean(team.dept))
      .map(team => team.dept)
  )];

  // Prepare options for Select components
  const expertOptions = expertsList.map((expert) => ({
    value: expert.reg_num,
    label: `${expert.name} (${expert.reg_num})`,
  }));

  const guideOptions = guidesList.map((guide) => ({
    value: guide.reg_num,
    label: `${guide.name} (${guide.reg_num})`,
  }));

  // Custom filter for search functionality
  const customFilter = (option, inputValue) => {
    const label = option.label.toLowerCase();
    const value = option.value.toLowerCase();
    const search = inputValue.toLowerCase();
    return label.includes(search) || value.includes(search);
  };

  // Handle expert selection with max limit
  const handleExpertChange = (selectedOptions) => {
    if (selectedOptions.length > MAX_SELECTION) {
      alert(`You can select maximum ${MAX_SELECTION} experts`);
      return;
    }
    setSelectedExperts(selectedOptions.map(option => option.value));
  };

  // Handle guide selection with max limit
  const handleGuideChange = (selectedOptions) => {
    if (selectedOptions.length > MAX_SELECTION) {
      alert(`You can select maximum ${MAX_SELECTION} guides`);
      return;
    }
    setSelectedGuides(selectedOptions.map(option => option.value));
  };

  // Filter options to prevent selecting same staff as both guide and expert
  const filteredExpertOptions = expertOptions
    .filter(expert => !selectedGuides.includes(expert.value));

  const filteredGuideOptions = guideOptions
    .filter(guide => !selectedExperts.includes(guide.value));

  // Fetch project details if projectId exists
  useEffect(() => {
    if (!teamselector?.[0]?.team_id || !teamstatusselector.projectId) return;

    instance.get(`/student/get_project_details/${teamstatusselector.projectId}`)
      .then((res) => {
        if (res.status === 200) {
          setProjectData(res.data);
          setIsSuccess(true);
        }
      })
      .catch(console.error);
  }, [teamselector, teamstatusselector.projectId]);

  // Fetch staff lists (experts and guides)
  useEffect(() => {
    async function fetchStaff() {
      try {
        const [expertRes, guideRes] = await Promise.all([
          instance.get('/admin/get_users/staff', { withCredentials: true }),
          instance.get('/admin/get_users/staff', { withCredentials: true }),
        ]);

        if (expertRes.status === 200) setExpertsList(expertRes.data);
        if (guideRes.status === 200) setGuidesList(guideRes.data);
      } catch (err) {
        console.error('Fetch Error:', err);
        alert('Failed to load staff data');
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate all required fields
      const errors = [];
      if (!teamselector[0]?.team_id) errors.push("Team information not loaded");
      if (!projectName.trim()) errors.push("Project name is required");
      if (selectedGuides.length === 0) errors.push("Please select at least one guide");
      if (selectedExperts.length === 0) errors.push("Please select at least one expert");
      if (selectedGuides.length > MAX_SELECTION) errors.push(`Maximum ${MAX_SELECTION} guides allowed`);
      if (selectedExperts.length > MAX_SELECTION) errors.push(`Maximum ${MAX_SELECTION} experts allowed`);
      
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Submit project first
      const projectResponse = await instance.post(
        `/student/addproject/${userselector.project_type}/${teamselector[0].team_id}/${userselector.reg_num}`,
        {
          project_name: projectName.trim(),
          cluster: clusterName,
          description: description,
          outcome: outcome,
          hard_soft: core
        }
      );

      const { project_id } = projectResponse.data;

      // Send guide requests
      await instance.post(
        `/guide/sent_request_to_guide/${userselector.semester}`,
        {
          from_team_id: teamselector[0].team_id,
          project_id,
          project_name: projectName.trim(),
          to_guide_reg_num: selectedGuides
        }
      );

      // Send expert requests
      await instance.post(
        `/sub_expert/sent_request_to_expert/${userselector.semester}`,
        {
          from_team_id: teamselector[0].team_id,
          project_id,
          project_name: projectName.trim(),
          to_expert_reg_num: selectedExperts
        }
      );

      alert('Project submitted successfully!');
      navigate('/student');
    } catch (error) {
      console.error('Submission error:', {
        message: error.message,
        response: error.response?.data,
        config: error.config
      });
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <>
      {isSuccess && projectData.length > 0 ? (
        <div className="max-w-3xl mx-auto mt-10">
          <h2 className="text-2xl flex justify-center font-semibold text-gray-800 mb-6 border-b pb-3">
            Project Details
          </h2>
          <ProjectDetailsView project={projectData[0]} />
        </div>
      ) : (
        <div>
          <h2 className="flex justify-center text-2xl font-bold mb-6">Project Submission</h2>
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
            {/* Project Name */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Project Name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            {/* Cluster and Project Type */}
            <div className='flex gap-4 mb-4'>
              <div className="w-[50%]">
                <label className="block mb-1 font-medium">Cluster Name</label>
                <select
                  value={clusterName}
                  onChange={(e) => setClusterName(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="" disabled>Select cluster</option>
                  {uniqueDepartments.map((dept, i) => (
                    <option key={i} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="w-[50%]">
                <label className="block mb-1 font-medium">Project Type</label>
                <select
                  value={core}
                  onChange={(e) => setCore(e.target.value)}
                  className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                >
                  <option value="" disabled>Select</option>
                  <option value="hardware">Hardware</option>
                  <option value="software">Software</option>
                </select>
              </div>
            </div>

            {/* Project Description */}
            <div className="mb-4">
              <label className="block mb-1 font-medium">Project Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={4}
                required
              />
            </div>

            {/* Expected Outcome */}
            <div className="mb-6">
              <label className="block mb-1 font-medium">Expected Outcome</label>
              <textarea
                value={outcome}
                onChange={(e) => setOutcome(e.target.value)}
                className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                rows={3}
                required
              />
            </div>

            {/* Subject Experts Selection */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">
                Select Subject Experts (Max {MAX_SELECTION})
              </h3>
              <Select
                options={filteredExpertOptions}
                isMulti
                onChange={handleExpertChange}
                value={filteredExpertOptions.filter(option => selectedExperts.includes(option.value))}
                placeholder={`Select up to ${MAX_SELECTION} experts...`}
                className="basic-multi-select"
                classNamePrefix="select"
                filterOption={customFilter}
                closeMenuOnSelect={false}
              />
              <p className="text-sm text-gray-500 mt-1">
                {selectedExperts.length} of {MAX_SELECTION} selected
              </p>
            </div>

            {/* Guides Selection */}
            <div className="mb-6">
              <h3 className="text-md font-medium mb-2">
                Select Guides (Max {MAX_SELECTION})
              </h3>
              <Select
                options={filteredGuideOptions}
                isMulti
                onChange={handleGuideChange}
                value={filteredGuideOptions.filter(option => selectedGuides.includes(option.value))}
                placeholder={`Select up to ${MAX_SELECTION} guides...`}
                className="basic-multi-select"
                classNamePrefix="select"
                filterOption={customFilter}
                closeMenuOnSelect={false}
              />
              <p className="text-sm text-gray-500 mt-1">
                {selectedGuides.length} of {MAX_SELECTION} selected
              </p>
            </div>

            {/* Submit Button */}
            <div className="text-center">
              <button
                type="submit"
                className="bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600 disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Project'}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default Project_Details;