const Listing = require("../models/listing")
const Review = require("../models/review")

module.exports.isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //save url
    // req.session.returnTo = req.originalUrl; // client should handle where to go after login
    return res.status(401).json({ error: "You must be logged in to perform this action" });
  }
  next();
}

//for redirectional perpos - Keeping this function but it might be unused in API context unless we keep session redirect logic. 
// For API, client handles redirection. But to avoid breaking other imports, I'll keep it as pass-through or minimal.
module.exports.saveRedirect = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
}

//authorization p1
module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  // Handle case where listing might not exist (handled in controller usually, but good to be safe)
  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }
  if (!listing.user._id.equals(req.user._id)) {
    return res.status(403).json({ error: "You are not the owner of this listing" });
  }
  next();
}

//authorization for review delete
module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review) {
    return res.status(404).json({ error: "Review not found" });
  }
  if (!review.author._id.equals(req.user._id)) {
    return res.status(403).json({ error: "You are not the author of this review" });
  }
  next();
}
