import { useState } from "react";
import "./Login.css";
import Google from "../../assets/google_img.png";
import Lock from "../../assets/lock_img.png";
import college_img from "../../assets/college_img.png";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import LockIcon from '@mui/icons-material/Lock';
import instance from "../../utils/axiosInstance";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../../utils/firebase";
import { useDispatch } from "react-redux";
import { addUser } from "../../utils/userSlice"; import { client, account } from './Appwrite';
import { styled } from '@mui/material/styles';
import { Button } from '@mui/material';
const GoogleButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.primary,
  border: `1px solid ${theme.palette.divider}`,
  padding: theme.spacing(1.5),
  borderRadius: theme.shape.borderRadius * 2,
  textTransform: 'none',
  fontWeight: 500,
  '& .MuiButton-startIcon': {
    color: '#4285F4',
  },
}));

const GoogleLogo = () => (
  <img
    src="https://developers.google.com/identity/images/g-logo.png"
    alt="Google logo"
    style={{ width: 20, height: 20 }}
  />
);

function Login() {
  const [emailId, setemailId] = useState("");
  const [password, setpassword] = useState("");
  const [showpassword, setshowpassword] = useState(false);
  const [showStudentPopup, setShowStudentPopup] = useState(false);
  const [studentUserData, setStudentUserData] = useState(null);
  const [selectedProjectType, setSelectedProjectType] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [companyAddress, setcompanyAddress] = useState("");
  const [contactNumber, setcontactNumber] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await instance.post("/auth/login", {
        emailId,
        password,
      });
      console.log(response);
      if (response.status === 200) {
        const { accessToken, refreshToken, role, reg_num } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        dispatch(addUser(response.data));

        if (role === "student") {
          const projectTypeRes = await instance.get(`/student/get_project_type/${reg_num}`);
          const projectType = projectTypeRes.data;
          console.log(projectType);


          if (projectType === "internal" || projectType == "external") {
            navigate("/student");
          } else {
            setStudentUserData(response.data);
            setShowStudentPopup(true);
          }
        } else {
          if (role === "admin") navigate("/admin");
          else if (role === "student") navigate("/student");
          else if (role === "staff") navigate("/guide");
          else alert("Unknown role");
        }
      }
    } catch (err) {
      console.error("Login error", err);
      alert("Invalid login");
    }
  };

  const updateProjectTypeAndNavigate = async (projectType, companyName, companyAddress, contactNumber) => {
    if (!studentUserData) return;
    const reg_num = studentUserData.reg_num;

    try {
      await instance.patch(
        `/student/alter_project_type/${reg_num}/${projectType}`,
        { "company_name": companyName, "company_address": companyAddress, "company_contact": contactNumber }
      );

      setShowStudentPopup(false);

      navigate("/student");
    } catch (err) {
      console.error("Failed to update project type", err);
      alert("Failed to set project type");
    }
  };

  const handleExternalSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCompany.trim() || !companyAddress.trim()) {
      alert("Please enter company name ,address and contact number.");
      return;
    }
    await updateProjectTypeAndNavigate("external", selectedCompany, companyAddress, contactNumber);
  };

  // function handleGoogleLogin() {
  //   account.createOAuth2Session(
  //     'google',
  //     'http://localhost:5173/login',
  //     'http://localhost:5173/login'
  //   );
  // }

  const login = () => {
    window.location.href = `${import.meta.env.VITE_CLIENT_URL}/auth/google`;
  };
  return (
    <>
      <div className="login_div">
        <form className="bg-white">
          <img
            src={college_img}
            style={{
              width: "50%",
              marginTop: "-6%",
              marginLeft: "25%",
              backgroundColor: "white"
            }}
            alt=""
          />
          <p className="Login">Hi, Welcome back</p><br />

          <div className="lnamediv bg-white">
            <p className="symbol">@</p>
            <input
              onChange={(e) => setemailId(e.target.value)}
              className="lname"
              type="email"
              name="username"
              placeholder="E-mail"
              required
            />
          </div>

          <div className="lpassdiv" style={{ position: "relative" }}>
            <LockIcon className="lock" />
            <input
              onChange={(e) => setpassword(e.target.value)}
              type={showpassword ? "text" : "password"}
              className="lpass"
              name="password"
              placeholder="Password"
              required
            />
            <span
              onClick={() => setshowpassword(!showpassword)}
              style={{
                position: "absolute", right: "10px", top: "50%",
                transform: "translateY(-50%)", cursor: "pointer", color: "#555", fontSize: "18px"
              }}
            >
              {showpassword ? <FaEye className="bg-white" /> : <FaEyeSlash className="bg-white" />}
            </span>
          </div>

          <button onClick={handleLogin} className="lbutton">Submit</button>

          <div className="divider">
            <hr /><span>or</span>
          </div>

          <GoogleButton
            fullWidth
            variant="contained"
            startIcon={<GoogleLogo />}
            onClick={login}
            size={'medium'}
          >
            Continue with Google
          </GoogleButton>
        </form>
      </div>

      {/* Popup for selecting project type and company name,address,contact number */}
      {showStudentPopup && (
        <div style={{
          position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999
        }}>
          <div style={{
            background: "white", padding: "30px", borderRadius: "8px", textAlign: "center", minWidth: "300px"
          }}>
            {!selectedProjectType && (
              <div className="w-auto bg-white">
                <h1 className="text-md md:text-xl font-semibold bg-white text-gray-800 mb-4">
                  Are you an internal or external student?
                </h1>
                <div className="flex bg-white flex-col-2 gap-4">
                  <button
                    onClick={() => updateProjectTypeAndNavigate("internal", "", "")}
                    className="px-6 py-3 w-[50%] bg-purple-500 text-white rounded-xl shadow hover:bg-purple-700"
                  >
                    Internal
                  </button>

                  <button
                    onClick={() => setSelectedProjectType("external")}
                    className="px-6 py-3 w-[50%] bg-green-600 text-white rounded-xl shadow hover:bg-green-700"
                  >
                    External
                  </button>
                </div>
              </div>
            )}

            {selectedProjectType === "external" && (
              <>
                <h1 className="text-md md:text-xl bg-white font-semibold text-gray-800 mb-4">Enter Company Details</h1>
                <form onSubmit={handleExternalSubmit} className="bg-white">
                  <input
                    type="text"
                    placeholder="Enter company name"
                    className="w-full p-2 border bg-white rounded mb-4"
                    value={selectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Enter company address"
                    className="w-full p-2 bg-white border rounded mb-4"
                    value={companyAddress}
                    onChange={(e) => setcompanyAddress(e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    placeholder="Enter contact number"
                    className="w-full p-2 bg-white border rounded mb-4"
                    value={contactNumber}
                    onChange={(e) => setcontactNumber(e.target.value)}
                    required
                  />
                  <button
                    onClick={() => setSelectedProjectType("")}
                    className="px-6 py-2 mt-2 bg-gray-300 text-black rounded hover:bg-gray-400"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
                  >
                    Submit
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default Login;