const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirect } = require("../Validators/isAthen.js");
const userController = require("../controller/user.js");

// GET /signup
router.get("/signup", userController.signUpGET);

// POST /signup
// router.post("/signup", wrapAsync(userController.signUpPOST));

router.get("/login", userController.loginGET);

router.post(
  "/login",
  saveRedirect,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.loginPOST
);

router.get("/logout", userController.logoutUser);

// router.post("/verify-code", userController.verifyCodePOST);

module.exports = router;
