const mongoose = require('mongoose');

const Activity = require("../models/activity");
const Listing = require("../models/listing");
const { getNeighborGrids, calculateDistance } = require("../utils/spatialMetrics");
const redisClient = require('../config/redis'); 

module.exports.getNearbyItems = async (lat, lon, gridId, excludeId, itemType = 'activity') => {
    const Model = itemType === 'activity' ? Activity : Listing;
    const cacheKey = `nearby:${itemType}:${excludeId}`;

    try {
        // 1. Redis Cache Check
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return JSON.parse(cachedData);
        }

        // 2. Expand Grid (5x5 covers ~5km)
        const targetGrids = getNeighborGrids(gridId, 2);

        // 3. MongoDB Aggregation (Pruning)
        const rawItems = await Model.aggregate([
            { $match: { gridId: { $in: targetGrids }, _id: { $ne: new mongoose.Types.ObjectId(excludeId) } } },
            { 
                $project: { 
                    title: 1, price: 1, latitude: 1, longitude: 1, location : 1,
                    thumbnail: { $arrayElemAt: ["$images.url", 0] },
                    ...(itemType === 'activity' && { difficulty: 1 }),
                    ...(itemType === 'listing' && { category: 1 })
                } 
            }
        ]);

        // 4. In-Memory Haversine & Categorization
        const results = { under3km: [], under5km: [] };
        rawItems.forEach(item => {
            const dist = calculateDistance(lat, lon, item.latitude, item.longitude);
            item.distance = parseFloat(dist.toFixed(2));

            if (item.distance <= 3) {
                results.under3km.push(item);
            } else if (item.distance <= 5) {
                results.under5km.push(item);
            }
        });

        // Sorting
        results.under3km.sort((a, b) => a.distance - b.distance);
        results.under5km.sort((a, b) => a.distance - b.distance);

        // 5. Save to Redis (TTL 24 hours)
        await redisClient.setEx(cacheKey, 86400, JSON.stringify(results));

        return results;

    } catch (err) {
        console.error("Spatial Service Error:", err);
        return { under3km: [], under5km: [] }; // Safety fallback
    }
};