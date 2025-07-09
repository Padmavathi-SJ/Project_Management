require("dotenv").config();
const express = require("express");
const router = express.Router();
const db = require("../db");
const createError = require("http-errors");
const validate = require("../utils/validator");
const jwt = require("jsonwebtoken");
const userAuth = require("../middlewares/userAuth");
// const client = require("../utils/redis");
const bcrypt = require("bcrypt");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


router.post("/auth/login", (req, res, next) => {
  const { emailId, password } = req.body;
  try {
    if (!emailId || !password) throw createError.BadRequest();
    validate(emailId, password);

    const sql = "SELECT * FROM users WHERE emailId = ?";
    db.query(sql, [emailId], async (error, results) => {
      if (error) return next(error);
      if (results.length === 0) return next(createError.Conflict("User does not exist"));

      const user = results[0];
      const reg_num = user.reg_num;

      if (password !== user.password) return next(createError.Unauthorized("Username/Password invalid"));

      const roles = {
        sub_expert_reg_num: null,
        guide_reg_num: null,
        mentor_reg_num: null
      };

      // Query teams
      db.query("SELECT sub_expert_reg_num, guide_reg_num FROM teams WHERE reg_num = ?", [reg_num], (err1, teamRes) => {
        if (err1) return next(err1);
        if (teamRes.length > 0) {
          roles.sub_expert_reg_num = teamRes[0].sub_expert_reg_num;
          roles.guide_reg_num = teamRes[0].guide_reg_num;
        }

        // Query mentors_mentees
        db.query("SELECT mentor_reg_num FROM mentors_mentees WHERE mentee_reg_num = ?", [reg_num], (err2, mentorRes) => {
          if (err2) return next(err2);
          if (mentorRes.length > 0) {
            roles.mentor_reg_num = mentorRes[0].mentor_reg_num;
          }
          // console.log(roles, "roles");
          // Generate JWT after both queries
          const token = jwt.sign({
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.emailId
          }, process.env.TOKEN_SECRET, { expiresIn: "1h" });

          res.cookie("token", token, {
            httpOnly: true,
            secure: false,
            sameSite: "lax",
            maxAge: 6 * 60 * 60 * 1000
          });

          res.status(200).json({
            message: "User logged in successfully",
            id: user.id,
            emailId: user.emailId,
            password: user.password,
            role: user.role,
            project_id: user.project_id,
            reg_num: user.reg_num,
            name: user.name,
            dept: user.dept,
            project_type: user.project_type,
            semester: user.semester,
            ...roles
          });
        });
      });
    });
  } catch (error) {
    next(error);
  }
});


router.post("/auth/refresh-token", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return next(createError.BadRequest("Refresh token is required"));

    const userId = await verifyRefreshToken(refreshToken);
    // creating tokens
    const newAccessTokens = jwt.sign({ id: userId }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
    const newRefreshTokens = jwt.sign({ id: userId }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
    // setting in redis
    await client.set(userId.toString(), newRefreshTokens, { EX: 604800 })
    res.status(200).json({
      message: "new Refresh token successfully generated",
      "newAccessToken": newAccessTokens,
      "newRefreshToken": newRefreshTokens
    })
  }
  catch (error) {
    next(error);
  }
})

router.post("/auth/role", (req, res, next) => {
  try {
    let sql = "select role from users where emailId = ?";
    const values = [req.body.emailId];
    db.query(sql, values, (error, result) => {
      if (error) return next(error);
      res.send(result);
    })
  }
  catch (error) {
    next(error);
  }
})

router.delete("/auth/logout", async (req, res, next) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax"
    });
    res.status(200).send("User logged out successfully");
  }
  catch (error) {
    next(error);
  }
})

// google review
// In /auth/google-login route

// router.post("/auth/google-login", async (req, res) => {
//   const { token } = req.body;
//   console.log("Received token:", token);

//   if (!token) {
//     return res.status(400).json({ message: "No token provided" });
//   }

//   try {
//     // ✅ Verify token using Google OAuth2Client
//     const ticket = await client.verifyIdToken({
//       idToken: token,
//       audience: process.env.GOOGLE_CLIENT_ID,
//     });
//     const decoded = ticket.getPayload();
//     console.log("Verified Google user:", decoded);

//     // ✅ Now lookup your user in DB
//     db.query("SELECT * FROM student WHERE emailId = ?", [decoded.email], async (err, result) => {
//       if (err) {
//         console.error("DB Error:", err);
//         return res.status(500).json({ message: "Internal server error" });
//       }

//       if (result.length === 0) {
//         return res.status(404).json({ message: "User not found in system" });
//       }

//       const user = result[0];

//       // ✅ Sign your JWT
//       const jwtToken = jwt.sign(
//         {
//           id: user.id,
//           role: user.role,
//           name: user.name,
//           email: user.emailId,
//         },
//         process.env.TOKEN_SECRET,
//         { expiresIn: "7d" }
//       );

//       res.cookie("token", jwtToken, {
//         httpOnly: true,
//         secure: false,
//         sameSite: "lax",
//         maxAge: 60 * 60 * 1000,
//       });

//       res.status(200).json({
//         message: "User logged in successfully",
//         ...user,
//       });
//     });
//   } catch (err) {
//     console.error("Google token verification failed:", err.message);
//     res.status(401).json({ message: "Invalid or expired token" });
//   }
// });

module.exports = router;