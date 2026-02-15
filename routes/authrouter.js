const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");

// Route to send verification code
router.post("/sendVerification", authController.sendVerification);

// Route to verify the code
router.post("/verify", authController.verifyCode);

// Route to complete the signup after verification
// router.post("/completeSignup", authController.completeSignup);

module.exports = router;
