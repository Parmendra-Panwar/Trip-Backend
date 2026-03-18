const express = require("express");
const router = express.Router();
const validateActivity = require("../Validators/activityValidator.js");
const wrapAsync = require("../utils/wrapAsync.js");
const { isloggedIn, isActivityOwner } = require("../Validators/isAthen.js");
const activityController = require("../controller/activity.js");
const multer = require('multer')
const { storage } = require("../config/cloudConfig.js")
const upload = multer({ storage })

router.route("/")
  .get(wrapAsync(activityController.index))
  .post(
    isloggedIn,
    upload.array('images', 7),
    validateActivity,
    wrapAsync(activityController.createNewpost)
  )

router.route("/:id")
  .get(wrapAsync(activityController.showActivity))
  .delete(
    isloggedIn,
    isActivityOwner,
    wrapAsync(activityController.destroy)
  )
  .put(
    isloggedIn,
    isActivityOwner,
    upload.array('images', 7),
    validateActivity,
    wrapAsync(activityController.updateActivity)
  );

module.exports = router;
