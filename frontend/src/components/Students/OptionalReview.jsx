import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";

const OptionalReview = () => {
  const navigate = useNavigate();
  const { student_reg_num, team_id } = useParams();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [projectDetails, setProjectDetails] = useState(null);
  const [eligibleReviews, setEligibleReviews] = useState([]);
  const [isEligible, setIsEligible] = useState(false);

  const [formData, setFormData] = useState({
    request_reason: "",
    semester: location.state?.semester || "7",
    review_type: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Check eligibility
        const eligibilityRes = await axios.get(
          `http://localhost:5000/api/optional-reviews/eligibility/${student_reg_num}`,
          { params: { semester: formData.semester } }
        );
        setIsEligible(!!eligibilityRes.data.isEligible);

        if (!eligibilityRes.data.isEligible) {
          setError(eligibilityRes.data.error || "You are not eligible for optional review");
          setLoading(false);
          return;
        }

        // 2. Fetch project details
        const projectRes = await axios.get(
          `http://localhost:5000/api/optional-reviews/projects/team/${team_id}`
        );
        setProjectDetails(projectRes.data);

        // 3. Fetch eligible reviews (where student is absent)
        const reviewsRes = await axios.get(
          `http://localhost:5000/api/optional-reviews/eligible-reviews/${student_reg_num}`,
          { params: { semester: formData.semester } }
        );
        setEligibleReviews(reviewsRes.data.eligibleReviews);

        if (!reviewsRes.data.eligibleReviews || reviewsRes.data.eligibleReviews.length === 0) {
          setError("You are not absent in any reviews for this semester");
        }
      } catch (err) {
        setError(
          err.response?.data?.error || err.message || "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [student_reg_num, team_id, formData.semester]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.review_type) {
      setError("Please select a review type");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        student_reg_num,
        team_id,
        project_id: projectDetails.project_id,
        guide_reg_num: projectDetails.guide_reg_num,
        sub_expert_reg_num: projectDetails.sub_expert_reg_num || ""
      };

      const response = await axios.post(
        "http://localhost:5000/api/optional-reviews/post-request",
        payload
      );

      if (response.data?.status) {
        alert("Request submitted successfully!");
        navigate(-1);
      } else {
        throw new Error(response.data?.message || "Request failed");
      }
    } catch (err) {
      setError(
        err.response?.data?.error ||
        err.response?.data?.message ||
        err.message
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h2 className="text-2xl font-bold mb-6">Optional Review Request</h2>

      {loading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="mb-6 p-4 bg-red-100 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      ) : !isEligible ? (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Not Eligible</p>
          <p>You are not eligible for optional review</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      ) : eligibleReviews.length === 0 ? (
        <div className="mb-6 p-4 bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Not Eligible</p>
          <p>You are not absent in any reviews for this semester</p>
          <button
            onClick={() => navigate(-1)}
            className="mt-2 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
          >
            Go Back
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester
                </label>
                <select
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="5">Semester 5</option>
                  <option value="6">Semester 6</option>
                  <option value="7">Semester 7</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Review <span className="text-red-500">*</span>
                </label>
                <select
                  name="review_type"
                  value={formData.review_type}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a review</option>
                  {eligibleReviews.map((review) => (
                    <option key={review.review_type} value={review.review_type}>
                      {review.review_type === 'review-1' ? 'First Review' : 'Second Review'}
                      {review.updated_at ? ` (Absent on ${new Date(review.updated_at).toLocaleDateString()})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reason for Request <span className="text-red-500">*</span>
              </label>
              <textarea
                name="request_reason"
                value={formData.request_reason}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Please explain why you need an optional review..."
                minLength="10"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Minimum 10 characters required
              </p>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Request"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default OptionalReview;