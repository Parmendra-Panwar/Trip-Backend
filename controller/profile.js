const User = require("../models/user");
const Trip = require("../models/trip");
const Activity = require("../models/activity");
const Listing = require("../models/listing");

module.exports.getProfile = async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 12 } = req.query;
  const skip = (page - 1) * limit;

  // Fetch one extra item to check if a next page exists
  const fetchLimit = Number(limit) + 1;

  const user = await User.findOne({ username })
    .populate('travelProfile')
    .populate('businessProfile');

  if (!user) return res.status(404).json({ error: "User not found" });

  const isNormal = user.roles.includes('NORMAL');
  const isBusiness = user.roles.includes('BUSINESS');
  
  let data = { user, trips: [], activities: [], listings: [] };
  let hasNext = { trips: false, activities: false, listings: false };

  // Fetch conditionally based on roles
  if (isNormal) {
    const trips = await Trip.find({ user: user._id }).skip(skip).limit(fetchLimit);
    hasNext.trips = trips.length > limit;
    data.trips = trips.slice(0, limit); 
  }
  if (isBusiness) {
    const activities = await Activity.find({ user: user._id }).skip(skip).limit(fetchLimit);
    hasNext.activities = activities.length > limit;
    data.activities = activities.slice(0, limit);

    const listings = await Listing.find({ user: user._id }).skip(skip).limit(fetchLimit);
    hasNext.listings = listings.length > limit;
    data.listings = listings.slice(0, limit);
  }

  res.json({
    ...data,
    currentPage: Number(page),
    hasNext,
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