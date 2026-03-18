const User = require("../models/user");
const Trip = require("../models/trip");
const Activity = require("../models/activity");
const Listing = require("../models/listing");

module.exports.getProfile = async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 12 } = req.query;
  const skip = (page - 1) * limit;

  const user = await User.findOne({ username })
    .populate('travelProfile')
    .populate('businessProfile');

  if (!user) return res.status(404).json({ error: "User not found" });

  const isNormal = user.roles.includes('NORMAL');
  const isBusiness = user.roles.includes('BUSINESS');
  
  let data = { user, trips: [], activities: [], listings: [] };

  // Fetch conditionally based on roles
  if (isNormal) {
    data.trips = await Trip.find({ user: user._id }).skip(skip).limit(Number(limit));
  }
  if (isBusiness) {
    data.activities = await Activity.find({ user: user._id }).skip(skip).limit(Number(limit));
    data.listings = await Listing.find({ user: user._id }).skip(skip).limit(Number(limit));
  }

  res.json({
    ...data,
    currentPage: Number(page),
    // Dummy followers for now
    followers: 1200, 
    following: 350
  });
};

module.exports.updateProfile = async (req, res) => {
  const { username } = req.params;
  const { about, roles } = req.body; 

  const updatedUser = await User.findOneAndUpdate(
    { username },
    { about, roles },
    { new: true }
  );

  res.json({ message: "Profile updated", user: updatedUser });
};