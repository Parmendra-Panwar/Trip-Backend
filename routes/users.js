const express = require("express");
const router = express.Router();
const userController = require("../controller/user.js");
const wrapAsync = require("../utils/wrapAsync");

// Route to login
router.post("/", wrapAsync(userController.login));

module.exports = router;
