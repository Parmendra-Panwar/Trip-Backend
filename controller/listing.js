const Listing = require("../models/listing");
const axios = require('axios');

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

  if (!listing) {
    return res.status(404).json({ error: "Listing not found" });
  }

  const placeName = listing.location;
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;

  let latitude = 20.5937; // Default
  let longitude = 78.9629; // Default

  try {
    const response = await axios.get(nominatimUrl, { timeout: 30000 });
    const data = response.data;
    if (data.length > 0) {
      latitude = data[0].lat;
      longitude = data[0].lon;
    }
  } catch (error) {
    console.error('Error fetching coordinates:', error);
  }

  res.json({
    listing,
    latitude,
    longitude
  });
};

module.exports.createNewpost = async (req, res, next) => {
  let url = req.file.path;
  let filename = req.file.filename;
  const newList = new Listing(req.body.listing);
  newList.user = req.user._id;
  newList.image = { url, filename }
  console.log(newList)
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
  let deleteListing = await Listing.findByIdAndDelete(id);
  res.json({ message: "Listing Deleted", deletedListing: deleteListing });
};
