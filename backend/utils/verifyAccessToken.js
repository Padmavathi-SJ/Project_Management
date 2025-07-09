require("dotenv").config();
const client = require("./redis");
const jwt = require("jsonwebtoken");
const createError = require("http-errors")

// the access token will be sent throught headers -> authorization -> bearers -> 
const verifyAccessToken = (req, res, next) => {
  if (!req.headers['authorization']) return next(createError.Unauthorized("Authorization header missing"));
  const authHeader = req.headers['authorization'];
  const bearer_Token = authHeader.split(' '); //creates an array
  const accessToken = bearer_Token[1];

  console.log(bearer_Token);
  console.log("Access Token:", accessToken);
  console.log("Secret:", process.env.ACCESS_TOKEN_SECRET);

  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (error, payload) => {
    if (error) {
      if (error.name === "JsonWebTokenError") {
        return next(createError.Unauthorized());
      }
      else {
        return next(createError.Unauthorized(error.message));
      }
    }
    // console.log("hi");
    req.payload = payload; //it attaches the userId to the next middleware
    next();
  })
}

module.exports = verifyAccessToken;


