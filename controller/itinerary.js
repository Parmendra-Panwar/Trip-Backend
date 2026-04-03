const { calculateDistance: haversineDistance } = require("../utilss/spatialMetrics");
const CityGrid = require("../models/CityGrid");
const getCoordinates = require("../utilss/getCoordinates");
const { findPath } = require("../utilss/aStarAlgorithm");
const { segmentPathAndFetchData } = require("../utilss/segmenter");
const redisClient = require('../config/redis');
const { calculateCityGridId: getGridIdStr } = require("../utilss/gridIdGenerator");
const Itinerary = require("../models/itinerary");
const ExpressError = require("../utilss/ExpressError");

module.exports.planItinerary = async (req, res) => {
    let { source, destination, days, budget, maxKmPerDay, travelMode } = req.body;

    source = source ? source.toLowerCase().trim() : 'bhopal';
    destination = destination ? destination.toLowerCase().trim() : 'pune';
    maxKmPerDay = Number(maxKmPerDxay) || 500;

    if (travelMode === 'train') maxKmPerDay = 1000;
    else if (travelMode === 'flight') maxKmPerDay = 2400;

    const parsedBudget = budget ? Number(budget) : Infinity;
    const targetDays = days ? Number(days) : null;

    const cacheKey = `${destination}:${targetDays || 'any'}:${parsedBudget === Infinity ? 'no-limit' : parsedBudget}:${maxKmPerDay}:${travelMode || 'any'}`;

    try {
        const cachedResult = await redisClient.get(cacheKey);
        if (cachedResult) {
            console.log("Serving Itinerary from Redis Cache!");
            return res.status(200).json(JSON.parse(cachedResult));
        }
    } catch (redisErr) {
        console.error("Redis Cache Read Error:", redisErr.message);
    }

    // console.time("Geocoding");
    const srcCoords = await getCoordinates(source);
    const destCoords = await getCoordinates(destination);
    // console.timeEnd("Geocoding");

    if (!srcCoords || !destCoords || !destCoords.lat) {
        throw new ExpressError(400, "Could not find valid coordinates for Source or Destination. Check spelling.");
    }

    const baseDistance = haversineDistance(srcCoords.lat, srcCoords.lon, destCoords.lat, destCoords.lon);

    if (baseDistance > maxKmPerDay * targetDays) {
        return res.status(200).json({
            success: false,
            totalDistance: Math.floor(baseDistance),
            message: "Itinerary cannot be planned as the distance is greater than the maximum distance per day.",
            days: null,
            source, destination, budget: parsedBudgect, maxKmPerDay, travelMode
        });
    }

    const startGridId = getGridIdStr(srcCoords.lat, srcCoords.lon);
    const destGridId = getGridIdStr(destCoords.lat, destCoords.lon);

    const corridorMap = new Map();
    corridorMap.set(startGridId, { centerLat: srcCoords.lat, centerLon: srcCoords.lon, city: source });
    corridorMap.set(destGridId, { centerLon: destCoords.lon, city: destination });

    let optimalPath = [];

    if (baseDistance <= maxKmPerDay) {
        optimalPath = [startGridId, destGridId];
    } else {
        const PADDING = 1.5;
        const minLat = Math.min(srcCoords.lat, destCoords.lat) - PADDING;
        const minLon = Math.min(srcCoords.lon, destCoords.lon) - PADDING;
        const maxLon = Math.max(srcCoords.lon, destCoords.lon) + PADDING;

        const rawGrids = await CityGrid.find({
            centerLat: { $gte: minLat, $lte: maxLat },
            centerLon: { $gte: minLon, $lte: maxLon },
            listingCount: { $gt: 0 }
        }).lean();

        const ALLOWED_DETOUR_KM = 250 + (baseDistance * 0.30);

        for (const grid of rawGrids) {
            const distFromSrc = haversineDistance(srcCoords.lat, grid.centerLat, grid.centerLon);
            const distToDest = haversineDistance(grid.centerLat, grid.centerLon, destCoords.lat, destCoords.lon);

            if ((distFromSrc + distToDest) <= (baseDistance + ALLOWED_DETOUR_KM)) {
                corridorMap.set(grid.cityGridId, grid);
            }
        }

        optimalPath = findPath(startGridId, destGridId, corridorMap, destCoords, maxKmPerDay);

        if (optimalPath.length === 0) {
            throw new ExpressError(404, "No viable overland route found with available stays.");
        }
    }

    const segmentResult = await segmentPathAndFetchData(optimalPaths, corridorMap, maxKmPerDay, parsedBudget, targetDays);

    const finalResponse = {
        success: true,
        totalDistance: Math.floor(baseDistance),
        message: segmentResult.message,
        days: segmentResult.days,
        source, destination, budget: parsedBudget, maxKmPerDay, travelMode
    };

    try {
        await redisClient.setEx(cacheKey, 43200, JSON.stringify(finalResponse));
    } catch (redisErr) {
        console.error("Redis Cache Write Error:", redisErr.message);
    }

    res.status(200).json(finalResponse);
};

module.exports.bookItinerary = async (req, res) => {
    const userId = req.user._id;
    const itineraryData = req.body;
    const data = itineraryData.data ? itineraryData.data : itineraryData;

    if (data.days && Array.isArray(data.days)) {
        data.days = data.days.map(day => {
            const cleanedDay = { ...day };
            if (!cleanedDay.selectedStay || cleanedDay.selectedStay === "") {
                delete cleanedDay.selectedStay;
            }
            if (cleanedDay.selectedActivities && Array.isArray(cleanedDay.selectedActivities)) {
                cleanedDay.selectedActivities = cleanedDay.selectedActivities.filter(a => a && a !== "");
            }
            return cleanedDay;
        });
    }

    const newItinerary = new Itinerary({
        user: userId,
        source: data.source,
        destination: data.destination,
        budget: data.budget,
        maxKmPerDay: data.maxKmPerDay,
        travelMode: data.travelMode,
        totalDistance: data.totalDistance,
        message: data.message,
        days: data.days
    });

    const savedItinerary = await newItinerary.save();
    res.status(201).json({ success: true, message: "Itinerary booked successfully", data: savedItinerary });
};

module.exports.getItineraryofauserId = async (req, res) => {
    const userId = req.user._id;
    const { page = 1, limit = 12 } = req.query;
    const skip = (page - 1) * limit;
    const fetchLimit = Number(limit) + 1;

    const itineraries = await Itinerary.find({ user: userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(fetchLimit);

    const hasNext = itineraries.length > limit;
    const data = itineraries.slice(0, limit);

    res.status(200).json({
        success: true,
        count: data.length,
        hasNext,
        data
    });
};

module.exports.showSingleItinerary = async (req, res) => {
    const { id } = req.params;
    const itinerary = await Itinerary.findById(id)
        .populate({ path: "days.selectedStay", model: "Listing" })
        .populate({ path: "days.selectedActivities", model: "Activity" });

    if (!itinerary) {
        throw new ExpressError(404, "Itinerary not found.");
    }

    res.status(200).json({ success: true, data: itinerary });
};