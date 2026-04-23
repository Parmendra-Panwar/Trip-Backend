import mongoose from "mongoose";
const { Schema } = mongoose;

const daySchema = new Schema({
    dayIndex: { type: Number, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    stopoverGridId: { type: String },
    distanceCovered: { type: Number },
    selectedStay: { type: Schema.Types.ObjectId, ref: 'Listing' },
    selectedActivities: [{ type: Schema.Types.ObjectId, ref: 'Activity' }]
});

const itinerarySchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    source: { type: String, required: true },
    destination: { type: String, required: true },
    budget: { type: Number },
    maxKmPerDay: { type: Number },
    travelMode: { type: String },
    totalDistance: { type: Number },
    message: { type: String },
    days: [daySchema],
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Itinerary", itinerarySchema);