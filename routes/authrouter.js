import express from "express";
const router = express.Router();
import * as authController from "../controller/authController.js";
import wrapAsync from "../utils/wrapAsync.js";

// Route to signup
router.post("/", wrapAsync(authController.signup));

export default router;