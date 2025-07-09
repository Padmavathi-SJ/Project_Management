import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Home, CheckSquare, FileText, Calendar, BarChart2, Users, LogOut } from 'lucide-react';
import college_img from "../../assets/college_img.png";
import menu from "../../assets/menu.png";
import wrong from "../../assets/wrong.png";
import instance from '../../utils/axiosInstance';
import { useDispatch } from 'react-redux';
import { removeUser} from '../../utils/userSlice';
import { removeTeamMembers } from '../../utils/teamSlice';
import {removeTeamStatus} from "../../utils/teamStatus";

function Subject_expert_navbar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const handleLogout = async () => {
    try {
      localStorage.clear();
      console.log("cleared all");
      let token = localStorage.getItem("refreshToken");
      await instance.delete("/auth/logout")
      dispatch(removeTeamMembers());
      dispatch(removeUser());
      dispatch(removeTeamStatus());
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      navigate("/login");
    }
  };

  const isActive = (path) => {
    const currentPath = location.pathname;
    if (path === "") return currentPath === "/subject_expert";
    return currentPath === `/subject_expert/${path}` || currentPath.startsWith(`/subject_expert/${path}/`);
  };

  const navDiv = (path) =>
    `ml-3 mb-10 flex items-center rounded-lg px-3 py-2 ${
      isActive(path) ? "bg-purple-400 text-white" : "bg-white"
    } ${isOpen ? "w-52" : "w-12"}`;

  const navIcon = (path) =>
    `${isActive(path) ? "bg-purple-400 text-white" : "bg-transparent bg-white text-gray-600 group-hover:text-purple-600"}`;

  const navText = (path) =>
    `ml-3 text-lg font-medium ${
      isOpen ? "opacity-100" : "opacity-0 hidden"
    } ${isActive(path) ? "bg-purple-400 text-white" : "text-gray-600 bg-white group-hover:text-purple-600"}`;

  return (
    <div
      className={`fixed top-0 pb-5 left-0 h-screen bg-white flex flex-col py-6 overflow-y-auto shadow-2xl z-50 transition-[width] duration-500 ease-in-out
         ${isOpen ? "w-64" : "w-24"}`}
    >
      <button
        onClick={toggleSidebar}
        className={`relative top-3 w-12 h-10 p-2 bg-white text-black rounded-md transition-all ${isOpen ? "left-48" : "left-5"}`}
      >
        <img
          src={isOpen ? wrong : menu}
          alt="Toggle Sidebar"
          className="w-full h-full object-contain bg-white border-none"
        />
      </button>

      <div className="h-32 bg-white mt-6">
        <img
          src={college_img}
          className={`w-1/2 mx-auto bg-white mb-12 transition-all duration-300 ${isOpen ? "w-1/2" : "w-2/3 mt-7"}`}
          alt="College Logo"
        />
      </div>

      <div className="bg-white px-2">
        {/* Dashboard Link */}
        <Link to="." className={`${navDiv("")} group`}>
          <Home size={24} className={navIcon("")} />
          <p className={navText("")}>Dashboard</p>
        </Link>

        

        {/* Review Projects Link */}
        <Link to="review" className={`${navDiv("review")} group`}>
          <FileText size={24} className={navIcon("review")} />
          <p className={navText("review")}>Review Projects</p>
        </Link>

        <Link to="remarks" className={`${navDiv("remarks")} group`}>
          <BarChart2 size={24} className={navIcon("remarks")} />
          <p className={navText("remarks")}>Remarks</p>
        </Link>


        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-3 flex items-center mt-auto mb-5 px-3 py-2 text-gray-600 hover:text-red-500"
        >
          <LogOut size={24} className="mr-5 bg-white rotate-180" />
          <p className={`ml-3 bg-white text-lg transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 hidden"}`}>
            Logout
          </p>
        </button>
      </div>
    </div>
  );
}

export default Subject_expert_navbar;
