const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const trip = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: String, // Insta location tag jaisa
  images: {
    type: [{ url: String, filename: String }],
    default: [],
    validate: [val => val.length <= 7, '{PATH} exceeds the limit of 7']
  },
  tags: [{ type: String, trim: true, lowercase: true, default: ["mountains", "friends", "bhopal"] }], // e.g., ["mountains", "friends", "bhopal"]
  createdAt: { type: Date, default: Date.now },
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true }
});

trip.post("findOneAndDelete", async (trip) => {
  if (trip) await Review.deleteMany({ _id: { $in: trip.reviews } });
});

module.exports = mongoose.model("Trip", trip);