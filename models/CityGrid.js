const mongoose = require("mongoose");

const cityGridSchema = new mongoose.Schema({
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

module.exports = mongoose.model('CityGrid', cityGridSchema);