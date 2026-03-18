const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  about: { type: String },
  roles: { 
    type: [String], 
    enum: ['NORMAL', 'BUSINESS'], 
    default: ['NORMAL'] 
  },
  // References to separate profiles
  travelProfile: { type: Schema.Types.ObjectId, ref: 'TravelProfile' },
  businessProfile: { type: Schema.Types.ObjectId, ref: 'BusinessProfile' }
});

module.exports = mongoose.model("User", userSchema);