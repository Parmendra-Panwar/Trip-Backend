import express from "express";
const router = express.Router();
import validateListing from "../Validators/listingValidator.js";
import wrapAsync from "../utils/wrapAsync.js";
import { isloggedIn, isOwner } from "../Validators/isAthen.js";
import * as listingController from "../controller/listing.js";
import multer from 'multer';
import { storage } from "../config/cloudConfig.js"
const upload = multer({ storage })


router.route("/")
  .get(wrapAsync(listingController.index))
  .post(
    isloggedIn,
    upload.array('images', 7),
    validateListing,
    wrapAsync(listingController.createNewpost)
  )

router.route("/:id")
  .get(wrapAsync(listingController.showListing))
  .delete(
    isloggedIn,
    isOwner,
    wrapAsync(listingController.destroy)
  )
  .put(
    isloggedIn,
    isOwner,
    upload.array('images', 7),
    validateListing,
    wrapAsync(listingController.updateListing)
  );

export default router;