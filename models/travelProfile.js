const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const travelProfileSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  savedTrips: [{ type: Schema.Types.ObjectId, ref: 'Trip' }], 
});

module.exports = mongoose.model("TravelProfile", travelProfileSchema);