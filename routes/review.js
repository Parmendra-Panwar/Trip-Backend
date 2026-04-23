import express from "express";
const router = express.Router({ mergeParams: true });
import wrapAsync from "../utils/wrapAsync.js";
import validateReview from "../Validators/reviewValidator.js";
import { isloggedIn, isReviewAuthor } from "../Validators/isAthen.js";
import * as reviewController from "../controller/review.js";

//post
router.post(
  "/",
  isloggedIn,
  validateReview,
  wrapAsync(reviewController.createNewReview)
);

//delete review post route
router.delete(
  "/:reviewId", isloggedIn, isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

export default router;