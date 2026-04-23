import { activitySchema } from "../schema.js";
import { ExpressError } from "../utils/ExpressError.js";

const validateActivity = (req, res, next) => {
  let { error } = activitySchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};

export default validateActivity;