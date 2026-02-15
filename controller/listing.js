const Listing = require("../models/listing");

module.exports.index = async (req, res) => {
  const allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
};

module.exports.createNewget = async (req, res) => {
  res.render("listings/new.ejs");
};

const axios = require('axios');

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
    req.flash("error", "Listing you requested does not exist");
    return res.redirect("/listings");
  }

  const placeName = listing.location; // e.g., "Malibu"
  const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(placeName)}&format=json&limit=1`;

  try {
    const response = await axios.get(nominatimUrl, { timeout: 30000 }); // Increase timeout
    const data = response.data;

    const latitude = data.length > 0 ? data[0].lat : 20.5937; // Default to India's latitude
    const longitude = data.length > 0 ? data[0].lon : 78.9629; // Default to India's longitude

    res.render('listings/show', {
      listing,
      latitude,
      longitude
    });
  } catch (error) {
    console.error('Error fetching coordinates:', error);
    res.render('listings/show', {
      listing,
      latitude: null,
      longitude: null
    });
  }
};



module.exports.createNewpost = async (req, res, next) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "send Valid data to listing");
  // }
  // let result = listingSchema.validate(req.body);
  // console.log(result);
  // if (result.error) {
  //   throw new ExpressError(400, result.error);
  // }
  let url = req.file.path;
  let filename = req.file.filename;
  const newList = new Listing(req.body.listing);
  newList.user = req.user._id;
  newList.image = { url, filename }
  console.log(newList)
  await newList.save();
  req.flash("success", "New Listing Created");
  res.redirect("/listings");
};

module.exports.editListing = async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing are you requested for does not exist");
    res.redirect("/listings");
  }
  let originalImageUrl = listing.image.url;
  //console.log(originalImageUrl);
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250");
  //console.log(originalImageUrl)
  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

module.exports.updateListing = async (req, res) => {
  // if (!req.body.listing) {
  //   throw new ExpressError(400, "send Valid data to listing");
  // }
  let { id } = req.params;
  let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "Listing Updated");
  res.redirect(`/listings/${id}`);
};

module.exports.destroy = async (req, res) => {
  let { id } = req.params;
  let deleteListing = await Listing.findByIdAndDelete(id);
  req.flash("success", "Listing Deleted");
  res.redirect("/listings");
};
