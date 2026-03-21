const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const listingSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Homestays & Guesthouses', 'Hotels & Motels', 'Heritage & Unique Stays'],
    required: true,
    default: 'Homestays & Guesthouses',
  },
  images: {
    type: [{ url: String, filename: String }],
    default: [],
    validate: [val => val.length <= 7, '{PATH} exceeds the limit of 7']
  },
  price: { type: Number, required: true },
  location: { type: String, required: true },
  country: { type: String, required: true },
  latitude: { type: Number }, 
  longitude: { type: Number },
  tags: [{ type: String, trim: true, lowercase: true, default: ["wifi", "pool", "budget"] }],
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  gridId: { type: String, index: true },
});

listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) await Review.deleteMany({ _id: { $in: listing.reviews } });
});

module.exports = mongoose.model("Listing", listingSchema);