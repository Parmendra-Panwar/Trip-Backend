const sharp = require('sharp');
const mongoose = require('mongoose');
const ExpressError = require("../utils/ExpressError.js");
const Activity = require("../models/activity");
const Review = require("../models/review");
const uploadToCloudinary = require("../utils/uploadToCloudinary.js");
const getCoordinates = require("../utils/getCoordinates.js");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary.js");
const processImage = require("../utils/imageProcess.js");

module.exports.index = async (req, res) => {
  let { lastId, limit = 12 } = req.query;
  limit = parseInt(limit);

  let query = {};
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    query = { _id: { $lt: lastId } };
  }

  const activities = await Activity.find(query)
    .sort({ _id: -1 })
    .limit(limit);

  const nextCursor = activities.length > 0 ? activities[activities.length - 1]._id : null;

  res.json({
    activities: activities,
    nextCursor: nextCursor,
    hasNextPage: activities.length === limit
  });
};

module.exports.showActivity = async (req, res) => {
    let { id } = req.params;
    const activity = await Activity.findById(id)
        .populate({ path: "reviews", populate: { path: "author", select: "username" } })
        .populate("user");

    if (!activity) throw new ExpressError(404, "Activity not found");

    if (!activity.latitude || !activity.longitude) {
        const coords = await getCoordinates(activity.location);
        if (coords) {
            activity.latitude = coords.lat;
            activity.longitude = coords.lon;
            await activity.save();
        }
    }

    let latitude = activity.latitude || 20.5937;
    let longitude = activity.longitude || 78.9629;

    res.json({ activity, latitude, longitude });
};

module.exports.createNewpost = async (req, res) => {
    if (!req.files || req.files.length === 0) throw new ExpressError(400, "At least one image is required");

    const newActivity = new Activity(req.body.activity);
    newActivity.user = req.user._id;

    const coords = await getCoordinates(newActivity.location);
    if (coords) {
        newActivity.latitude = coords.lat;
        newActivity.longitude = coords.lon;
    }

    const uploadPromises = req.files.map(async (file) => {
        const processedBuffer = await processImage(file.buffer);
        const result = await uploadToCloudinary(processedBuffer);
        return { url: result.secure_url, filename: result.public_id };
    });

    newActivity.images = await Promise.all(uploadPromises);
    await newActivity.save();
    res.status(201).json(newActivity);
};

module.exports.updateActivity = async (req, res) => {
    let { id } = req.params;
    
    let activity = await Activity.findById(id);
    if (!activity) throw new ExpressError(404, "Activity not found");

    if (req.body.activity?.location && req.body.activity.location !== activity.location) {
        const coords = await getCoordinates(req.body.activity.location);
        if (coords) {
            activity.latitude = coords.lat;
            activity.longitude = coords.lon;
        }
    }

    Object.assign(activity, req.body.activity);

    if (req.files && req.files.length > 0) {
        await deleteFromCloudinary(activity.images);

        const uploadPromises = req.files.map(async (file) => {
            const processedBuffer = await processImage(file.buffer);
            const result = await uploadToCloudinary(processedBuffer);
            return { url: result.secure_url, filename: result.public_id };
        });

        activity.images = await Promise.all(uploadPromises);
    }

    await activity.save();
    res.json({ message: "Activity Updated", activity });
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new ExpressError(404, "Activity not found");

    if (activity.images && activity.images.length > 0) {
        await deleteFromCloudinary(activity.images);
    }

    if (activity.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: activity.reviews } });
    }

    await Activity.findByIdAndDelete(id);
    res.json({ message: "Activity and all associated data deleted" });
};
