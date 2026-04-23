import mongoose from "mongoose";
const { Schema } = mongoose;

const gridSchema = new Schema({
    gridId: { type: String, unique: true, index: true },
    city: String,
    minPriceStay: { type: Number, default: Infinity },
    activityCount: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
});
export default mongoose.model('Grid', gridSchema);