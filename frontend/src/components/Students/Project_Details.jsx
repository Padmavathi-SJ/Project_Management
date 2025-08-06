import React, { useEffect, useState } from 'react';
import instance from '../../utils/axiosInstance';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import Select from 'react-select';

// Constants
const MAX_SELECTION = 4; // Maximum allowed selections for guides/experts

// Helper component: Loading Spinner
const LoadingSpinner = () => (
  <div className="flex justify-center items-center p-6">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
  </div>
);

const ProjectDetailsView = ({ project }) => {
  return (
    <div className="max-w-5xl mx-auto bg-white p-8 rounded shadow space-y-8">
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
  const { team_id } = useParams(); // Get team_id from URL parameters
  const userselector = useSelector((State) => State.userSlice);
  const teamstatusselector = useSelector((State) => State.teamStatusSlice);

  // Form state
  const [formData, setFormData] = useState({
    project_name: '',
    cluster: '',
    description: '',
    outcome: '',
    hard_soft: 'software',
    semester: userselector.semester || 6
  });

  // Staff data
  const [allStaff, setAllStaff] = useState([]);
  const [selectedGuides, setSelectedGuides] = useState([]);
  const [selectedExperts, setSelectedExperts] = useState([]);
  const [tl_reg_num, setTlRegNum] = useState('');

  // UI state
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [projectData, setProjectData] = useState([]);
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

// Filter staff options - now all staff can be both guides and experts
const getFilteredStaff = (type, excludeRegNums = []) => {
  return allStaff
    .filter(staff => !excludeRegNums.includes(staff.reg_num))
    .map(staff => ({
      value: staff.reg_num,
      label: `${staff.name} (${staff.reg_num}) - ${staff.dept}`,
      ...staff
    }));
};

  // Get available options based on current selections
// Get available options - no role filtering needed
const availableGuides = getFilteredStaff('guide', [...selectedGuides, ...selectedExperts]);
const availableExperts = getFilteredStaff('expert', [...selectedGuides, ...selectedExperts]);

const handleExpertChange = (selectedOptions) => {
  if (selectedOptions.length > MAX_SELECTION) {
    alert(`You can select maximum ${MAX_SELECTION} experts`);
    return;
  }
  const newExperts = selectedOptions.map(option => option.value);
  
  // Remove any selected guides that are in the new experts selection
  setSelectedGuides(prev => prev.filter(guide => !newExperts.includes(guide)));
  
  setSelectedExperts(newExperts);
};

// Handle selections - prevent same staff from being both guide and expert
const handleGuideChange = (selectedOptions) => {
  if (selectedOptions.length > MAX_SELECTION) {
    alert(`You can select maximum ${MAX_SELECTION} guides`);
    return;
  }
  const newGuides = selectedOptions.map(option => option.value);
  
  // Remove any selected experts that are in the new guides selection
  setSelectedExperts(prev => prev.filter(exp => !newGuides.includes(exp)));
  
  setSelectedGuides(newGuides);
};

  // Fetch initial data
// Fetch initial data
useEffect(() => {
  const fetchData = async () => {
    try {
      // Check if team_id exists
      if (!team_id) {
        throw new Error('Team ID is missing');
      }

      // Check if project already exists
      if (teamstatusselector.projectId) {
        const res = await instance.get(
          `/student/get_project_details/${teamstatusselector.projectId}`
        );
        if (res.status === 200) {
          setProjectData(res.data);
          setIsSuccess(true);
          return;
        }
      }

      // Fetch team-specific data
      const response = await instance.get(`/student/${team_id}/form-data`);
      
      if (response.data.success) {
        const { tl_reg_num, departments, guides, experts } = response.data.data;
        setTlRegNum(tl_reg_num);
        setDepartments(departments);
        setAllStaff([...guides, ...experts]);
      } else {
        throw new Error(response.data.message || 'Failed to load form data');
      }
    } catch (err) {
      console.error('Fetch Error:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to load project data';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [team_id, teamstatusselector.projectId]);
  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate inputs
      const errors = [];
      if (!formData.project_name.trim()) errors.push("Project name is required");
      if (!formData.cluster) errors.push("Cluster is required");
      if (selectedGuides.length === 0) errors.push("Please select at least one guide");
      if (selectedExperts.length === 0) errors.push("Please select at least one expert");
      
      if (errors.length > 0) {
        throw new Error(errors.join('\n'));
      }

      // Submit project
      const response = await instance.post(
        `/student/${team_id}/create`,
        {
          ...formData,
          tl_reg_num,
          selectedGuides,
          selectedExperts,
          project_type: userselector.project_type || 'internal'
        }
      );

      if (response.data.success) {
        alert('Project submitted successfully!');
        navigate('/student');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(`Error: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  if (isSuccess && projectData.length > 0) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <h2 className="text-2xl flex justify-center font-semibold text-gray-800 mb-6 border-b pb-3">
          Project Details
        </h2>
        <ProjectDetailsView project={projectData[0]} />
      </div>
    );
  }

  return (
    <div>
      <h2 className="flex justify-center text-2xl font-bold mb-6">Project Submission</h2>
      <form onSubmit={handleSubmit} className="max-w-3xl mx-auto p-4 bg-white rounded-lg shadow">
        {/* Project Name */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Project Name</label>
          <input
            type="text"
            value={formData.project_name}
            onChange={(e) => setFormData({...formData, project_name: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>

        {/* Department/Cluster Selection */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Department/Cluster</label>
          <select
            value={formData.cluster}
            onChange={(e) => setFormData({...formData, cluster: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="">Select Department</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
        </div>

        {/* Project Type */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Project Type</label>
          <select
            value={formData.hard_soft}
            onChange={(e) => setFormData({...formData, hard_soft: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          >
            <option value="software">Software</option>
            <option value="hardware">Hardware</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="block mb-1 font-medium">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={4}
            required
          />
        </div>

        {/* Expected Outcome */}
        <div className="mb-6">
          <label className="block mb-1 font-medium">Expected Outcome</label>
          <textarea
            value={formData.outcome}
            onChange={(e) => setFormData({...formData, outcome: e.target.value})}
            className="w-full border px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            rows={3}
            required
          />
        </div>

        {/* Guides Selection */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">
            Select Guides (Max {MAX_SELECTION})
          </h3>
          <Select
            options={availableGuides}
            isMulti
            onChange={handleGuideChange}
            value={availableGuides.filter(option => selectedGuides.includes(option.value))}
            placeholder={`Select up to ${MAX_SELECTION} guides...`}
            className="basic-multi-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
          />
          <p className="text-sm text-gray-500 mt-1">
            {selectedGuides.length} of {MAX_SELECTION} selected
          </p>
        </div>

        {/* Experts Selection */}
        <div className="mb-6">
          <h3 className="text-md font-medium mb-2">
            Select Subject Experts (Max {MAX_SELECTION})
          </h3>
          <Select
            options={availableExperts}
            isMulti
            onChange={handleExpertChange}
            value={availableExperts.filter(option => selectedExperts.includes(option.value))}
            placeholder={`Select up to ${MAX_SELECTION} experts...`}
            className="basic-multi-select"
            classNamePrefix="select"
            closeMenuOnSelect={false}
          />
          <p className="text-sm text-gray-500 mt-1">
            {selectedExperts.length} of {MAX_SELECTION} selected
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
  );
};

export default Project_Details;