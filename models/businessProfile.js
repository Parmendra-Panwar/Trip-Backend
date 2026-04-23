import mongoose from "mongoose";
const { Schema } = mongoose;

const businessProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  businessName: String,
  isVerified: { type: Boolean, default: false }
});

export default mongoose.model("BusinessProfile", businessProfileSchema);