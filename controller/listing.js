const sharp = require('sharp');
const mongoose = require('mongoose');
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../models/listing");
const Review = require("../models/review");
const uploadToCloudinary = require("../utils/uploadToCloudinary.js");
const getCoordinates = require("../utils/getCoordinates.js");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary.js");
const processImage = require("../utils/imageProcess.js")

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
        .populate({ path: "reviews", populate: { path: "author", select: "username" } })
        .populate("user");

    if (!listing) throw new ExpressError(404, "Listing not found");

    // 👇 TEMPORARY GEOCODING BLOCK START (Delete later) 👇
    if (!listing.latitude || !listing.longitude) {
        const coords = await getCoordinates(listing.location);
        if (coords) {
            listing.latitude = coords.lat;
            listing.longitude = coords.lon;
            await listing.save();
        }
    }
    // 👆 TEMPORARY GEOCODING BLOCK END 👆

    // Fallbacks if both DB and API fail
    let latitude = listing.latitude || 20.5937;
    let longitude = listing.longitude || 78.9629;

    res.json({ listing, latitude, longitude });
};

module.exports.createNewpost = async (req, res) => {
    if (!req.files || req.files.length === 0) throw new ExpressError(400, "At least one image is required");

    const newList = new Listing(req.body.listing);
    newList.user = req.user._id;

    // 1. Geocoding logic: Create ke time hi coordinates fetch karein
    const coords = await getCoordinates(newList.location);
    if (coords) {
        newList.latitude = coords.lat;
        newList.longitude = coords.lon;
    }

    // 2. Process and upload images (Sharp)
    const uploadPromises = req.files.map(async (file) => {
        const processedBuffer = await processImage(file.buffer);

        const result = await uploadToCloudinary(processedBuffer);
        return { url: result.secure_url, filename: result.public_id };
    });

    newList.images = await Promise.all(uploadPromises);
    await newList.save();
    res.status(201).json(newList);
};

module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    
    // 1. Purani listing find karo
    let listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    // 2. Check: Agar location update ho rahi hai toh Geocoding API call karo
    if (req.body.listing?.location && req.body.listing.location !== listing.location) {
        const coords = await getCoordinates(req.body.listing.location);
        if (coords) {
            listing.latitude = coords.lat;
            listing.longitude = coords.lon;
        }
    }

    // 3. Baaki text fields update karo
    Object.assign(listing, req.body.listing);

    // 4. Image handling logic
    if (req.file) {
        const processedBuffer = await processImage(req.file.buffer);
        const result = await uploadToCloudinary(processedBuffer);

        await deleteFromCloudinary(listing.images);
        listing.images = [{ url: result.secure_url, filename: result.public_id }];
    }

    await listing.save();
    res.json({ message: "Listing Updated", listing });
};

module.exports.destroy = async (req, res) => {
    let { id } = req.params;

    const listing = await Listing.findById(id);
    if (!listing) throw new ExpressError(404, "Listing not found");

    // Loop through the 'images' array to delete from Cloudinary
    await deleteFromCloudinary(listing.images);

    // Associated Reviews delete
    if (listing.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }

    await Listing.findByIdAndDelete(id);
    res.json({ message: "Listing and all associated data deleted" });
};