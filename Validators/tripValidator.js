const { tripSchema } = require("../schema.js");
const ExpressError = require("../utilss/ExpressError.js");

const validateTrip = (req, res, next) => {
  let { error } = tripSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

module.exports = validateTrip;
