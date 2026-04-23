import mongoose from "mongoose";
const { Schema } = mongoose;

const cityGridSchema = new Schema({
    cityGridId: { type: String, unique: true, index: true },
    city: String,
    centerLat: Number,
    centerLon: Number,
    minPriceStay: { type: Number, default: Infinity },
    avgPriceStay: { type: Number, default: 0 },
    totalStayPrice: { type: Number, default: 0 },
    activityCount: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
});

export default mongoose.model('CityGrid', cityGridSchema);