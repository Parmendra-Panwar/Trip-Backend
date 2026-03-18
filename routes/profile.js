const express = require("express");
const router = express.Router({ mergeParams: true });
const profileController = require("../controller/profile.js");
const wrapAsync = require("../utils/wrapAsync");
const { isloggedIn } = require("../Validators/isAthen.js");

router.get("/:username", wrapAsync(profileController.getProfile));
router.put("/:username", isloggedIn, wrapAsync(profileController.updateProfile));

module.exports = router;