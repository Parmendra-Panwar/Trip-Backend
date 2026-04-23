import mongoose from "mongoose";
const { Schema } = mongoose;

const travelProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  savedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }], 
});

export default mongoose.model("TravelProfile", travelProfileSchema);