const Listing = require("../models/listing")
const Review = require("../models/review")

module.exports.isloggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    //save url
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You Must be Logged in to create listing")
    return res.redirect('/login')
  }
  next();
}

//for redirectional perpos

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
  if (!listing.user._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You Are Not The Owner...!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}

//authorization for review delete

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;
  let review = await Review.findById(reviewId);
  if (!review.author._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You Are Not The Owner...!");
    return res.redirect(`/listings/${id}`);
  }
  next();
}
