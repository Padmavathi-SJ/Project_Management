import instance from "../utils/axiosInstance";
import { addUser } from "../utils/userSlice";

export const getProfile = async (dispatch, navigate) => {
  try {
    const response = await instance.get("/profile/view");

    if (response.status === 200) {
      const userData = response.data.data;
      console.log("Profile Data:", userData);
      dispatch(addUser(userData));

      if (userData.role) {
        routeUserByRole(userData.role, navigate);
      } else {
        console.error("User role not found. Redirecting to login...");
        navigate("/login");
      }
    } else {
      console.error("Failed to fetch profile:", response.status);
      navigate("/login");
    }
  } catch (error) {
    console.error("Error fetching profile:", error.response?.data?.message || error.message);
    if (error.response?.status === 401) {
      // Clear any existing token if present
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    }
    navigate("/login");
  }
};

const routeUserByRole = (role, navigate) => {
  switch (role) {
    case "student":
    case "ext_student":
      navigate("/student");
      break;
    case "teacher":
      navigate("/teacher");
      break;
    case "admin":
      navigate("/admin");
      break;
    case "guide":
      navigate("/guide");
      break;
    case "sub_expert":
      navigate("/subject_expert");
      break;
    default:
      console.error("Invalid user role. Redirecting to login...");
      navigate("/login");
      break;
  }
};
