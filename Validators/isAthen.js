const Listing = require("../models/listing")
const Review = require("../models/review")
const jwt = require("jsonwebtoken");
const User = require("../models/user");

module.exports.isloggedIn = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) return res.status(401).json({ error: "Access Denied, No token Provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // IMPORTANT: req.user ko populate karna padega
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

module.exports.isOwner = async (req, res, next) => {
  try {
    let { id } = req.params;
    let listing = await Listing.findById(id);

    if (!listing) return res.status(404).json({ error: "Listing not found" });

    // req.user ab isloggedIn se aa raha hai
    if (!listing.user._id.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not the owner" });
    }
    next();
  } catch (err) {
    next(err); // Central error handler ko bhej do
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    let { reviewId } = req.params;
    let review = await Review.findById(reviewId);

    if (!review) return res.status(404).json({ error: "Review not found" });

    if (!review.author._id.equals(req.user._id)) {
      return res.status(403).json({ error: "You are not the author" });
    }
    next();
  } catch (err) {
    next(err);
  }
};