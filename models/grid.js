const mongoose = require("mongoose");

const gridSchema = new mongoose.Schema({
    gridId: { type: String, unique: true, index: true },
    city: String,
    minPriceStay: { type: Number, default: Infinity },
    activityCount: { type: Number, default: 0 },
    listingCount: { type: Number, default: 0 },
});
module.exports = mongoose.model('Grid', gridSchema);