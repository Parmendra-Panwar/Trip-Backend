import Listing from "../models/listing.js";
import Trip from "../models/trip.js";
import Activity from "../models/activity.js";
import Review from "../models/review.js";

// Helper function to get the correct model dynamically
const getModelByType = (type) => {
    const models = {
        listings: Listing,
        trips: Trip,
        activities: Activity
    };
    return models[type];
};

export const createNewReview = async (req, res) => {
    const { type, id } = req.params;
    const TargetModel = getModelByType(type);

    if (!TargetModel) {
        return res.status(400).json({ error: "Invalid entity type" });
    }

    let parent = await TargetModel.findById(id);
    if (!parent) return res.status(404).json({ error: "Item not found" });

    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;

    parent.reviews.push(newReview);

    await newReview.save();
    await parent.save();

    await newReview.populate("author", "username");

    res.status(201).json({ message: "Review added successfully", review: newReview });
};

export const deleteReview = async (req, res) => {
    const { type, id, reviewId } = req.params;
    const TargetModel = getModelByType(type);

    if (!TargetModel) {
        return res.status(400).json({ error: "Invalid entity type" });
    }

    // remove review ID from Entity
    await TargetModel.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    
    // delete review document
    await Review.findByIdAndDelete(reviewId);

    res.json({ message: "Review Deleted" });
};