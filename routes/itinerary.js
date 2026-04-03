const express = require("express");
const router = express.Router();
const wrapAsync = require("../utilss/wrapAsync.js");
const { isloggedIn } = require("../Validators/isAthen.js");
const tripController = require("../controller/itinerary.js");

router.route("/plan-itinerary").post(wrapAsync(tripController.planItinerary))
router.route("/book").post(isloggedIn, wrapAsync(tripController.bookItinerary))
router.route("/user").get(isloggedIn, wrapAsync(tripController.getItineraryofauserId))
router.route("/single/:id").get(isloggedIn, wrapAsync(tripController.showSingleItinerary))

module.exports = router;

