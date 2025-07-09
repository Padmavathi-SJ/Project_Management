import { useState } from "react";
import "./Login.css";
import Google from "./assets/google_img.png";
import Lock from "./assets/lock_img.png";
import {BrowserRouter as Router,Routes,Route, BrowserRouter, useNavigate} from "react-router-dom"
import { FaEye, FaEyeSlash } from "react-icons/fa";
import React from "react";

function Signup() {

    const [name,setname] = useState("");
    const [password1,setpassword1] = useState("");
    const [password2,setpassword2] = useState("");
    const [showpassword1,setshowpassword1] = useState(false);
    const [showpassword2,setshowpassword2] = useState(false);
    const navigate = useNavigate()

  return (
    <>
        <div className="box"/>
        <div className="login_div">
          <p className="Login">Signup</p><br />
      
          <div className="lnamediv">
            <p className="symbol">@</p>
            <input 
              onChange={(e)=>{setname(e.target.value)}}
              className="lname" 
              type="text" 
              name="username" 
              placeholder="E-mail" 
              required
            />
          </div>
      
          <div className="lpassdiv" style={{ position: "relative" }}>
            <img 
              src={Lock} 
              className="lock" 
              alt="Lock" 
            />
            <input 
              onChange={(e)=>{setpassword1(e.target.value)}}
              type={showpassword1 ? "text" : "password"} 
              className="lpass" 
              name="password" 
              placeholder="Password" 
            />
             <span
          onClick={() => setshowpassword1(!showpassword1)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#555",
            fontSize: "18px",
            backgroundColor:"white"
          }}
        >
          {showpassword1 ? <FaEyeSlash style={{backgroundColor:'white',fontSize:"120%"}} /> : <FaEye style={{backgroundColor:'white',fontSize:"120%"}} />}
        </span><><p style={{fontSize:"000"}}>.</p></>
          </div>

          <div className="lpassdiv" style={{ position: "relative" }}>
            <img 
              src={Lock} 
              className="lock" 
              alt="Lock" 
            />
            <input 
              onChange={(e)=>{setpassword2(e.target.value)}}
              type={showpassword2 ? "text" : "password"} 
              className="lpass" 
              name="password" 
              placeholder="Password" 
            />
             <span
          onClick={() => setshowpassword2(!showpassword2)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "#555",
            fontSize: "18px",
            backgroundColor:"white"
          }}
        >
          {showpassword2 ? <FaEyeSlash style={{backgroundColor:'white',fontSize:"120%"}} /> : <FaEye style={{backgroundColor:'white',fontSize:"120%"}} />}
        </span><><p style={{fontSize:"000"}}>.</p></>
          </div>
      
          <button onClick={()=>{}} className="lbutton">Submit</button>
          
          <p style={{ backgroundColor: "white", marginBottom: "5%" ,fontSize:"110%"}}>or</p>
      
          <div className="gdiv">
            <img 
              src={Google} 
              className="google-logo" 
              alt="Google logo" 
            />
            <button className="glogin"  onClick={()=>{}}>Sign in with Google</button>
            
          </div>
          <div style={{backgroundColor:"white"}}>
          <p className="psignup">Already have an account? <a href="" onClick={()=>navigate('/login')}  className="linksignup">Login </a></p>
          </div>
        </div>
      </>
  )
}

export default Signup