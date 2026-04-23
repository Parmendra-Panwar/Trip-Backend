import express from "express";
const router = express.Router();
import validateActivity from "../Validators/activityValidator.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn, isActivityOwner } from "../Validators/isAthen.js";
import * as activityController from "../controller/activity.js";
import multer from 'multer'
import { storage } from "../config/cloudConfig.js"
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

export default router;