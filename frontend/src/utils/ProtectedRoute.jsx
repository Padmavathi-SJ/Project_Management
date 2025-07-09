import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Store } from "lucide-react";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("accessToken");
  const role = useSelector((Store) => Store.userSlice.role);
  console.log("role",role);

  if (!token) return <Navigate to="/" />
  if (allowedRole && role !== allowedRole) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
