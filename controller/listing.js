const Listing = require("../models/listing");
const axios = require('axios');
const { cloudinary } = require("../config/cloudConfig.js");
const ExpressError = require("../utils/ExpressError.js");
const mongoose = require('mongoose');

module.exports.index = async (req, res) => {
  // lastId ko string rehne dein, parseInt na karein
  let { lastId, limit = 12 } = req.query;
  limit = parseInt(limit);

  // Dynamic Query: Agar lastId hai toh usse purani listings uthao
  let query = {};
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    query = { _id: { $lt: lastId } }; // $lt (less than) kyuki _id creation time based hoti hai
  }

  // Fetch Listings
  const listings = await Listing.find(query)
    .sort({ _id: -1 }) // Latest first
    .limit(limit);

  // Next Cursor taiyar karein (Aakhri item ki ID)
  const nextCursor = listings.length > 0 ? listings[listings.length - 1]._id : null;

  res.json({
    listings: listings,
    nextCursor: nextCursor,
    hasNextPage: listings.length === limit
  });
};

module.exports.showListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "username",
      },
    })
    .populate("user");

  if (!listing) throw new ExpressError(404, "Listing not found");

  // Coordinates logic (Nominatim)
  let latitude = 20.5937, longitude = 78.9629;
  try {
    const response = await axios.get(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(listing.location)}&format=json&limit=1`, { timeout: 5000 });
    if (response.data.length > 0) {
      latitude = response.data[0].lat;
      longitude = response.data[0].lon;
    }
  } catch (error) { console.error('Geocoding error:', error.message); }

  res.json({ listing, latitude, longitude });
};

module.exports.createNewpost = async (req, res) => {
    // 1. Check if files exist
    if (!req.files || req.files.length === 0) {
        throw new ExpressError(400, "At least one image is required");
    }

    const newList = new Listing(req.body.listing);
    newList.user = req.user._id;

    // 2. Map through req.files correctly
    // FIX: f.path ki jagah f.secure_url ya f.url aur f.filename ki jagah f.public_id
    newList.images = req.files.map(f => ({
        url: f.secure_url || f.url, // Cloudinary secure_url deta hai
        filename: f.public_id       // Cloudinary filename ko public_id me rakhta hai
    }));

    await newList.save();
    res.status(201).json(newList);
};

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  res.json({ message: "Listing Updated", listing });
};

module.exports.destroy = async (req, res) => {
  let { id } = req.params;

  const listing = await Listing.findById(id);
  if (!listing) throw new ExpressError(404, "Listing not found");

  // 1. Cloudinary se Image Delete karo
  if (listing.image && listing.image.filename) {
    await cloudinary.uploader.destroy(listing.image.filename);
  }

  // 2. Associated Reviews delete karo
  if (listing.reviews.length > 0) {
    await Review.deleteMany({ _id: { $in: listing.reviews } });
  }

  // 3. Database se Listing delete karo
  const deletedListing = await Listing.findByIdAndDelete(id);

  res.json({ message: "Listing, Reviews, and Cloudinary Image deleted", deletedListing });
};