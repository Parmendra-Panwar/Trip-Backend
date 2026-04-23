import mongoose from 'mongoose';
import { ExpressError } from "../utils/ExpressError.js";
import Activity from "../models/activity.js";
import Review from "../models/review.js";
import uploadToCloudinary from "../utils/uploadToCloudinary.js";
import getCoordinates from "../utils/getCoordinates.js";
import deleteFromCloudinary from "../utils/deleteFromCloudinary.js";
import processImage from "../utils/imageProcess.js";
import { getNearbyItems } from "../services/spatialService.js";
import { invalidateNearbyCache } from "../services/cacheServiceRemove.js";
import { syncGridMetadata, removeGridMetadata } from '../services/gridService.js';

export const index = async (req, res) => {
  let { lastId, limit = 12 } = req.query;
  limit = parseInt(limit);

  let query = {};
  if (lastId && mongoose.Types.ObjectId.isValid(lastId)) {
    query = { _id: { $lt: lastId } };
  }

  const activities = await Activity.find(query)
    .sort({ _id: -1 })
    .limit(limit);

  const nextCursor = activities.length > 0 ? activities[activities.length - 1]._id : null;

  res.json({
    activities: activities,
    nextCursor: nextCursor,
    hasNextPage: activities.length === limit
  });
};

export const showActivity = async (req, res) => {
    let { id } = req.params;
    const activity = await Activity.findById(id)
        .populate({ path: "reviews", populate: { path: "author", select: "username" } })
        .populate("user");

    if (!activity) throw new ExpressError(404, "Activity not found");

    if (!activity.latitude || !activity.longitude) {
        const coords = await getCoordinates(activity.location);
        if (coords) {
            activity.latitude = coords.lat;
            activity.longitude = coords.lon;
            await activity.save();
        }
    }

    let nearbyActivities = { under3km: [], under5km: [] };
    let nearbyListings = { under3km: [], under5km: [] };

    // Agar spatial data hai, toh suggestions laao
    if (activity.gridId && activity.latitude && activity.longitude) {
        
        // Promise.all use karo taaki dono queries parallel run hon (Time bachega)
        [nearbyActivities, nearbyListings] = await Promise.all([
            getNearbyItems(activity.latitude, activity.longitude, activity.gridId, activity._id, 'activity'),
            getNearbyItems(activity.latitude, activity.longitude, activity.gridId, activity._id, 'listing')
        ]);
    }

    let latitude = activity.latitude || 20.5937;
    let longitude = activity.longitude || 78.9629;

    res.json({ activity, nearbyActivities, nearbyListings, latitude, longitude });
};

export const createNewpost = async (req, res) => {
    if (!req.files || req.files.length === 0) throw new ExpressError(400, "At least one image is required");

    const newActivity = new Activity(req.body.activity);
    newActivity.user = req.user._id;

    const coords = await getCoordinates(newActivity.location);
    if (coords) {
        newActivity.latitude = coords.lat;
        newActivity.longitude = coords.lon;

        const generatedGrids = await syncGridMetadata(newActivity, 'activity');
        if (generatedGrids) {
            newActivity.gridId = generatedGrids.gridId;
            newActivity.cityGridId = generatedGrids.cityGridId;
        }
    }

    const uploadPromises = req.files.map(async (file) => {
        const processedBuffer = await processImage(file.buffer);
        const result = await uploadToCloudinary(processedBuffer);
        return { url: result.secure_url, filename: result.public_id };
    });

    newActivity.images = await Promise.all(uploadPromises);
    await newActivity.save();
    res.status(201).json(newActivity);
};

export const updateActivity = async (req, res) => {
    let { id } = req.params;
    let activity = await Activity.findById(id);
    
    if (!activity) throw new ExpressError(404, "Activity not found");

    // 1. Location & Coordinates Update
    // Frontend se data 'activity[location]' format mein aata hai
    if (req.body.activity?.location && req.body.activity.location !== activity.location) {
        const coords = await getCoordinates(req.body.activity.location);
        if (coords) {
            // Remove old counts
            await removeGridMetadata(activity, 'activity');

            activity.latitude = coords.lat;
            activity.longitude = coords.lon;

            // Sync new counts
            const generatedGrids = await syncGridMetadata(activity, 'activity');
            if (generatedGrids) {
                activity.gridId = generatedGrids.gridId;
                activity.cityGridId = generatedGrids.cityGridId;
            }
        }
    }

    // 2. Specific Image Deletion Logic
    if (req.body.remainingImages) {
        const remaining = JSON.parse(req.body.remainingImages); 
        
        // Find images to delete from Cloudinary (Jo purani mein thi par remaining mein nahi hain)
        const imagesToDelete = activity.images.filter(img => 
            !remaining.some(rem => rem.filename === img.filename)
        );

        if (imagesToDelete.length > 0) {
            await deleteFromCloudinary(imagesToDelete); 
        }
        
        // Database mein sirf wahi rakho jo user ne delete nahi ki
        activity.images = remaining;
    }

    // 3. New Images Append Logic
    if (req.files && req.files.length > 0) {
        const uploadPromises = req.files.map(async (file) => {
            const processedBuffer = await processImage(file.buffer);
            const result = await uploadToCloudinary(processedBuffer);
            return { url: result.secure_url, filename: result.public_id };
        });

        const newImages = await Promise.all(uploadPromises);
        
        // Nayi images ko remaining list mein add karo
        activity.images.push(...newImages); 
    }

    // 4. Update Other Metadata (Title, Price, Description, etc.)
    // Ensure images field doesn't get messed up by req.body
    const updateData = { ...req.body.activity };
    delete updateData.images; // Image hum manually handle kar chuke hain

    Object.assign(activity, updateData);
    
    await activity.save();
    await invalidateNearbyCache(id);

    res.json({ message: "Activity Updated Successfully", activity });
};

export const destroy = async (req, res) => {
    let { id } = req.params;

    const activity = await Activity.findById(id);
    if (!activity) throw new ExpressError(404, "Activity not found");

    if (activity.images && activity.images.length > 0) {
        await deleteFromCloudinary(activity.images);
    }

    if (activity.reviews.length > 0) {
        await Review.deleteMany({ _id: { $in: activity.reviews } });
    }

    await removeGridMetadata(activity, 'activity');

    await Activity.findByIdAndDelete(id);
    await invalidateNearbyCache(id);
    res.json({ message: "Activity and all associated data deleted" });
};
