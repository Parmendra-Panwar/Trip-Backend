import express from "express";
const router = express.Router();
import * as userController from "../controller/user.js";
import wrapAsync from "../utils/wrapAsync.js";

// Route to login
router.post("/", wrapAsync(userController.login));

export default router;