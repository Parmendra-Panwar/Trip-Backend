import express from "express";
const router = express.Router();
import validateTrip from "../Validators/tripValidator.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn, isTripOwner } from "../Validators/isAthen.js";
import * as tripController from "../controller/trip.js";
import multer from 'multer';
import { storage } from "../config/cloudConfig.js"

const upload = multer({ storage })

router.route("/")
  .get(wrapAsync(tripController.index))
  .post(
    isloggedIn,
    upload.array('images', 7),
    validateTrip,
    wrapAsync(tripController.createNewpost)
  )

router.route("/:id")
  .get(wrapAsync(tripController.showTrip))
  .delete(
    isloggedIn,
    isTripOwner,
    wrapAsync(tripController.destroy)
  )
  .put(
    isloggedIn,
    isTripOwner,
    upload.array('images', 7),
    validateTrip,
    wrapAsync(tripController.updateTrip)
  );

export default router;