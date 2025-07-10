require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const createError = require("http-errors");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
const db = require("./db");

const PORT = process.env.PORT || 5000;

// Route imports
const authRoute = require("./Routes/authRoute");
const teacherRoute = require("./Routes/teacherRoute");
const studentRoute = require("./Routes/studentRoute");
const adminRouter = require("./Routes/adminRoute");
const guideRouter = require("./Routes/guideRoute");
const subjectExpertRouter = require("./Routes/subjectExpertRouter");
const uploadRouter = require("./Routes/uploadRoute");
const mentorRoute = require("./Routes/mentorRoute");
const generalRoute = require("./Routes/generalRoute");

const guideRoutes = require("./Routes/guide_routes");
const sub_expertRoutes = require('./Routes/sub-expert_routes.js')
const studentReviewRoutes = require('./Routes/student_routes.js');

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
app.use(passport.initialize());
console.log(process.env.CLIENT_URL);
app.use(
    cors({
        origin: process.env.CLIENT_URL,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
        exposedHeaders: ["set-cookie"]
    })
);

// // Helper functions
// function getUserDetails(email) {
//     return new Promise((resolve, reject) => {
//         const sql = "SELECT * FROM users WHERE emailId = ?";
//         db.query(sql, [email], (error, results) => {
//             if (error) return reject(error);
//             resolve(results[0] || null);
//         });
//     });
// }

function generateToken(user) {
    return jwt.sign(
        {
            id: user.id,
            role: user.role,
            name: user.name,
            email: user.emailId,

        },
        process.env.TOKEN_SECRET,
        { expiresIn: "1d" }
    );
}

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

    if (!token) {
        return next(createError.Unauthorized("Access denied. No token provided."));
    }

    jwt.verify(token, process.env.TOKEN_SECRET, (err, user) => {
        if (err) {
            return next(createError.Forbidden("Invalid token"));
        }
        req.user = user;
        next();
    });
}

// Passport Google OAuth Configuration
passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/auth/google/callback",
            proxy: true,
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                const email = profile.emails[0].value;
                const findUserSql = "SELECT * FROM users WHERE google_id = ? OR emailId = ?";
                // console.log(profile.name, "profile.name");

                db.query(findUserSql, [profile.id, email], async (error, users) => {
                    if (error) return done(error);

                    let user;
                    if (users.length === 0) {
                        // No user found with this email or google_id - redirect with message
                        return done(null, false, { message: 'User not found' });
                    } else {
                        user = users[0];
                        // Case 1: User exists with this email but no google_id - update it
                        if (!user.google_id && user.emailId === email) {
                            const updateSql = "UPDATE users SET google_id = ? , name = ? WHERE id = ?";
                            db.query(updateSql, [profile.id, profile.name.givenName + " " + profile.name.familyName, user.id], (updateError) => {
                                if (updateError) return done(updateError);
                                return done(null, user);
                            });
                        }
                        // Case 2: User exists with this google_id - proceed
                        else if (user.google_id === profile.id) {
                            return done(null, user);
                        }
                        // Case 3: Email exists but belongs to a different account
                        else {
                            return done(null, false, { message: 'Email already registered with another account' });
                        }
                    }
                });
            } catch (err) {
                console.error("Error in Google strategy:", err);
                return done(err, null);
            }
        }
    )
);


// Passport serialization
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser((id, done) => {
    const sql = "SELECT id, emailId, name, role, reg_num FROM users WHERE id = ?";
    db.query(sql, [id], (error, users) => {
        if (error) return done(error);
        if (users.length === 0) return done(new Error("User not found"), null);

        const user = {
            id: users[0].id,
            emailId: users[0].emailId,
            name: users[0].name,
            role: users[0].role,
            reg_num: users[0].reg_num
        };

        done(null, user);
    });
});

// Routes
app.get(
    "/auth/google",
    passport.authenticate("google", {
        scope: ["profile", "email"],
        prompt: "select_account",
    })
);


app.get(
    "/auth/google/callback",
    passport.authenticate("google", {
        failureRedirect: process.env.CLIENT_URL + "/login?error=google_failed",
        session: false,
    }),
    async (req, res) => {
        try {
            if (!req.user) {
                const message = req.authInfo?.message || 'Authentication failed';
                return res.redirect(process.env.CLIENT_URL + `/login?error=${encodeURIComponent(message)}`);
            }

            // Generate consistent payload structure
            const tokenPayload = {
                id: req.user.id,
                role: req.user.role || 'student', // Default role
                name: req.user.name,
                email: req.user.emailId,

            };

            const token = jwt.sign(tokenPayload, process.env.TOKEN_SECRET, { expiresIn: "1d" });

            // Set cookie
            res.cookie("token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 24 * 60 * 60 * 1000,
                domain: process.env.NODE_ENV === "production" ? ".yourdomain.com" : "localhost",
                path: "/",
            });

            // Redirect with token in URL for client-side handling
            const redirectUrl = new URL(`${process.env.CLIENT_URL}/google-auth`);
            redirectUrl.searchParams.set('token', token);
            res.redirect(redirectUrl.toString());

        } catch (err) {
            console.error("Error in Google callback:", err);
            res.redirect(process.env.CLIENT_URL + "/login?error=server_error");
        }
    }
);

app.get("/api/user", authenticateJWT, (req, res, next) => {
    try {
        // console.log(req.user.id, "/api/user");
        const sql = "SELECT * FROM users WHERE id = ?";
        db.query(sql, [req.user.id], async (error, users) => {
            if (error) return next(error);
            if (users.length === 0) {
                return res.status(404).json({ error: "User not found" });
            }
            // console.log(users);
            const user = users[0];
            // const userDetails = await getUserDetails(user.email);

            res.json({
                isAuthenticated: true,
                user: {
                    ...user,
                },
            });
        });
    } catch (err) {
        next(err);
    }
});

app.use("/", studentReviewRoutes);
console.log("Student review routes mounted");

// Mount routes
app.use("/", authRoute);
app.use("/", teacherRoute);
app.use("/", studentRoute);
app.use("/", adminRouter);
app.use("/", guideRouter);
app.use("/", subjectExpertRouter);
app.use("/", uploadRouter);
app.use("/", mentorRoute);
app.use("/", generalRoute);

app.use("/api/guide", guideRoutes);
app.use("/", sub_expertRoutes);


// Serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// 404 Handler
app.use((req, res, next) => {
    next(createError.NotFound("Endpoint not found"));
});

// Error Handler
app.use((error, req, res, next) => {
    res.status(error.status || 500);
    res.send({
        error: {
            status: error.status || 500,
            message: error.message,
        },
    });
});

// Start server
app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
);