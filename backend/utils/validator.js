const validator = require("validator");
const createError = require("http-errors");

const validate = (emailId,password) => {
    try{
       if(!validator.isEmail(emailId))
       {
         throw new Error("Not a valid emailId");
       }
       else if(!validator.isStrongPassword(password))
       {
         throw new Error("Not a strong password");
       }
    }
    catch(error)
    {
      next(error);
    }
}

module.exports = validate;