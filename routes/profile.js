import express from "express";
const router = express.Router({ mergeParams: true });

import * as profileController from "../controller/profile.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn } from "../Validators/isAthen.js";

router.get("/:username", wrapAsync(profileController.getProfile));
router.put("/:username", isloggedIn, wrapAsync(profileController.updateProfile));

export default router;