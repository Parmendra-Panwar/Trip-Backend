const { activitySchema } = require("../schema.js");
const ExpressError = require("../utilss/ExpressError.js");

const validateActivity = (req, res, next) => {
  let { error } = activitySchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports = validateActivity;
