const express = require("express");
const router = express.Router();
const authController = require("../controller/authController");
const wrapAsync = require("../utilss/wrapAsync");

// Route to signup
router.post("/", wrapAsync(authController.signup));

module.exports = router;
