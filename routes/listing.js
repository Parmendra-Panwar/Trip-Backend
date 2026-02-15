const express = require("express");
const router = express.Router();
const validateListing = require("../Validators/listingValidator.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedIn, isOwner } = require("../Validators/isAthen.js");
const listingController = require("../controller/listing.js");
const multer = require('multer')
const { storage } = require("../config/cloudConfig.js")
const upload = multer({ storage })


router.route("/").get(wrapAsync(listingController.index))
  .post(
    isloggedIn, upload.single("image"),
    validateListing,
    wrapAsync(listingController.createNewpost)
  )

router.get("/new", isloggedIn, wrapAsync(listingController.createNewget));

router.route("/:id").get(wrapAsync(listingController.showListing)).delete(
  isloggedIn,
  isOwner,
  wrapAsync(listingController.destroy)
).put(
  isloggedIn,
  isOwner,
  upload.single("image"),
  validateListing,
  wrapAsync(listingController.updateListing)
);

router.get(
  "/:id/edit",
  isloggedIn,
  isOwner,
  wrapAsync(listingController.editListing)
);

module.exports = router;