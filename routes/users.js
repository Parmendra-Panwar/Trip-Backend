const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirect } = require("../Validators/isAthen.js");
const userController = require("../controller/user.js");

router.post(
  "/login",
  saveRedirect,
  userController.login
);

router.get("/logout", userController.logoutUser);

module.exports = router;
