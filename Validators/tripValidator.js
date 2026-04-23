import { tripSchema } from "../schema.js";
import { ExpressError } from "../utils/ExpressError.js";

const validateTrip = (req, res, next) => {
  let { error } = tripSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
  } else {
    next();
  }
};
export default validateTrip;