const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const validateReview = require("../Validators/reviewValidator.js");
const Listing = require("../models/listing.js");
const { isloggedIn, isReviewAuthor } = require("../Validators/isAthen.js")
const reviewController = require("../controller/review.js")

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

module.exports = router;
