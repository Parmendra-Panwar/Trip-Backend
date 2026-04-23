import User from "../models/user.js";
import Trip from "../models/trip.js";
import Activity from "../models/activity.js";
import Listing from "../models/listing.js";

export const getProfile = async (req, res) => {
  const { username } = req.params;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const fetchLimit = limit + 1;

  const user = await User.findOne({ username })
    .populate('travelProfile')
    .populate('businessProfile');

  if (!user) return res.status(404).json({ error: "User not found" });

  const isNormal = user.roles.includes('NORMAL');
  const isBusiness = user.roles.includes('BUSINESS');

  let data = { user, trips: [], activities: [], listings: [] };
  let hasNext = { trips: false, activities: false, listings: false };

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
    currentPage: page,
    hasNext,
    followers: 1200,
    following: 350
  });
};

export const updateProfile = async (req, res) => {
  const { username } = req.params;
  const { about, roles } = req.body;

  const updatedUser = await User.findOneAndUpdate(
    { username },
    { about, roles },
    { new: true }
  );

  res.json({ message: "Profile updated", user: updatedUser });
};