const express = require("express");
const router = express.Router();
const validateTrip = require("../Validators/tripValidator.js");
const wrapAsync = require("../utilss/wrapAsync.js");
const { isloggedIn, isTripOwner } = require("../Validators/isAthen.js");
const tripController = require("../controller/trip.js");
const multer = require('multer')
const { storage } = require("../config/cloudConfig.js")
const upload = multer({ storage })

router.route("/")
  .get(wrapAsync(tripController.index))
  .post(
    isloggedIn,
    upload.array('images', 7),
    validateTrip,
    wrapAsync(tripController.createNewpost)
  )

router.route("/:id")
  .get(wrapAsync(tripController.showTrip))
  .delete(
    isloggedIn,
    isTripOwner,
    wrapAsync(tripController.destroy)
  )
  .put(
    isloggedIn,
    isTripOwner,
    upload.array('images', 7),
    validateTrip,
    wrapAsync(tripController.updateTrip)
  );

module.exports = router;
