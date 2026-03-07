const Listing = require("../models/listing");
const axios = require('axios');
const { cloudinary } = require("../config/cloudConfig.js");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.json(allListings);
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
  // Check if file exists
  if (!req.file) throw new ExpressError(400, "Image is required");

  const newList = new Listing(req.body.listing);
  newList.user = req.user._id; // req.user now comes from JWT middleware
  newList.image = { url: req.file.path, filename: req.file.filename };

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