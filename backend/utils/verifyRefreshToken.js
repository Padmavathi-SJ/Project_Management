require("dotenv").config();
const createError = require("http-errors");
const jwt = require("jsonwebtoken");
const client = require("./redis");

const verifyRefreshToken = async (refreshToken) => {
  try{
    const payload = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET);
    const userId = String(payload.id) // it will be stored  as an object
    const storedToken  = await client.get(userId);

    if(refreshToken === storedToken) return userId;
    else throw createError.Unauthorized("token mismatch");
  }
  catch(error)
  {
    throw createError.Unauthorized(error.message);
  }
} 

module.exports = verifyRefreshToken;