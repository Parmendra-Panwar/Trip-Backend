const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");

const activitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
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
  duration: String, // e.g., "3 hours", "Full Day"
  difficulty: { 
    type: String, 
    enum: ['Easy', 'Moderate', 'Hard', 'High-Risk'] 
  },
  tags: [{ type: String, trim: true, lowercase: true }], // e.g., ["rafting", "trekking", "camping"]
  reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
  user: { type: Schema.Types.ObjectId, ref: 'User', index: true },
  gridId: { type: String, index: true },
  cityGridId: { type: String, index: true },
});

activitySchema.post("findOneAndDelete", async (activity) => {
  if (activity) await Review.deleteMany({ _id: { $in: activity.reviews } });
});

module.exports = mongoose.model("Activity", activitySchema);