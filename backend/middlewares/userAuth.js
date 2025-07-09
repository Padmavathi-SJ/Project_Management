const jwt = require("jsonwebtoken");
const createError = require("http-errors");
const db = require("../db");

const userAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "TokenMissing",
        shouldRedirect: true // Add this flag for frontend handling
      });
    }

    const decodedMessage = jwt.verify(token, process.env.TOKEN_SECRET);

    let sql = "SELECT * FROM users WHERE id = ?";
    db.query(sql, [decodedMessage.id], (error, result) => {
      if (error) return next(error);

      if (result.length === 0) {
        return res.status(401).json({
          success: false,
          message: "User does not exist!",
          shouldRedirect: true
        });
      }

      req.user = decodedMessage.id;
      next();
    });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Invalid token!",
        shouldRedirect: true
      });
    }
    if (error.name === "TokenExpiredError") {
      res.clearCookie("token");
      return res.status(401).json({
        success: false,
        message: "Token has expired!",
        shouldRedirect: true
      });
    }
    next(error);
  }
};
module.exports = userAuth;
