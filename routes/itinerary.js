import express from "express";
const router = express.Router();
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";
import * as tripController from "../controller/itinerary.js";

router.route("/plan-itinerary").post(wrapAsync(tripController.planItinerary))
router.route("/book").post(isloggedIn, wrapAsync(tripController.bookItinerary))
router.route("/user").get(isloggedIn, wrapAsync(tripController.getItineraryofauserId))
router.route("/single/:id").get(isloggedIn, wrapAsync(tripController.showSingleItinerary))

export default router;