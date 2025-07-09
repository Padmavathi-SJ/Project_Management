import axios from "axios";
import { useNavigate } from "react-router-dom";

// Create an Axios instance
const instance = axios.create({
  baseURL: import.meta.env.VITE_CLIENT_URL,
  withCredentials: true
});


instance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.error?.message || error.response?.data?.message;
    if (error.response && error.response.status === 401) {
      if (["TokenExpired", "TokenMissing", "Invalid token!"].includes(message)) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  response => response,
  error => {
    if (error.response && error.response.status === 400) {
      // Normalize 400 error responses
      error.message = error.response.data.message || 
                     error.response.data.error || 
                     "Invalid request data";
    }
    return Promise.reject(error);
  }
);

// Add this to your axios instance configuration
instance.interceptors.response.use(
  response => {
    // Convert string responses to objects for consistent handling
    if (typeof response.data === 'string') {
      response.data = { message: response.data };
    }
    return response;
  },
  error => {
    // Convert error responses to consistent format
    if (error.response) {
      if (typeof error.response.data === 'string') {
        error.response.data = { message: error.response.data };
      }
    }
    return Promise.reject(error);
  }
);
export default instance;