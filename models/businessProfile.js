const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const businessProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  businessName: String,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model("BusinessProfile", businessProfileSchema);