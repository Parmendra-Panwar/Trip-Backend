const sharp = require('sharp');
const mongoose = require('mongoose');
const ExpressError = require("../utils/ExpressError.js");
const Trip = require("../models/trip");
const Review = require("../models/review");
const uploadToCloudinary = require("../utils/uploadToCloudinary.js");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary.js");
const processImage = require("../utils/imageProcess.js");

module.exports.index = async (req, res) => {
  let { lastId, limit = 12 } = req.query;
  limit = parseInt(limit);

  let query = {};
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    query = { _id: { $lt: lastId } };
  }

  const trips = await Trip.find(query)
    .sort({ _id: -1 })
    .limit(limit);

  const nextCursor = trips.length > 0 ? trips[trips.length - 1]._id : null;

  res.json({
    trips: trips,
    nextCursor: nextCursor,
    hasNextPage: trips.length === limit
  });
};

module.exports.showTrip = async (req, res) => {
    let { id } = req.params;
    const trip = await Trip.findById(id)
        .populate({ path: "reviews", populate: { path: "author", select: "username" } })
        .populate("user");

    if (!trip) throw new ExpressError(404, "Trip not found");

    res.json({ trip });
};

module.exports.createNewpost = async (req, res) => {
    if (!req.files || req.files.length === 0) throw new ExpressError(400, "At least one image is required");

    const newTrip = new Trip(req.body.trip);
    newTrip.user = req.user._id;

    const uploadPromises = req.files.map(async (file) => {
        const processedBuffer = await processImage(file.buffer);
        const result = await uploadToCloudinary(processedBuffer);
        return { url: result.secure_url, filename: result.public_id };
    });

    newTrip.images = await Promise.all(uploadPromises);
    await newTrip.save();
    res.status(201).json(newTrip);
};

module.exports.updateTrip = async (req, res) => {
    let { id } = req.params;
    let trip = await Trip.findById(id);
    if (!trip) throw new ExpressError(404, "Trip not found");

    // 1. Specific Image Deletion
    if (req.body.remainingImages) {
        const remaining = JSON.parse(req.body.remainingImages);
        
        const imagesToDelete = trip.images.filter(img => 
            !remaining.some(rem => rem.filename === img.filename)
        );

        if (imagesToDelete.length > 0) {
            await deleteFromCloudinary(imagesToDelete);
        }
        
        trip.images = remaining;
    }

    // 2. Append New Images
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const processedBuffer = await processImage(file.buffer);
            const result = await uploadToCloudinary(processedBuffer);
            return { url: result.secure_url, filename: result.public_id };
        });

        const newImages = await Promise.all(uploadPromises);
        trip.images.push(...newImages);
    }

    // 3. Update Text Fields
    const updateData = { ...req.body.trip };
    delete updateData.images;

    Object.assign(trip, updateData);

    await trip.save();
    res.json({ message: "Trip Updated Successfully", trip });
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;

    const trip = await Trip.findById(id);
    if (!trip) throw new ExpressError(404, "Trip not found");

    if (trip.images && trip.images.length > 0) {
        await deleteFromCloudinary(trip.images);
    }

    if (trip.reviews && trip.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: trip.reviews } });
    }

    await Trip.findByIdAndDelete(id);
    res.json({ message: "Trip and all associated data deleted" });
};
