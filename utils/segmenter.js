import Listing from "../models/listing.js";
import Activity from "../models/activity.js";
import { calculateDistance } from "./spatialMetrics.js";

export const segmentPathAndFetchData = async (path, corridorMap, maxKmPerDay, budget, targetDays) => {
    console.time("Segment_Total_Time");
    
    const days = [];
    let currentDayDist = 0;
    let dayCounter = 1;
    let lastStopoverIdx = 0;

    let currentBudget = budget;
    let warningMessage = null;

    const fetchStaysAndActivities = async (gridId) => {
        console.time(`Parallel_Fetch_${gridId}`);

        // Parallel calls using Promise.all
        const [stays, activities] = await Promise.all([
            Listing.aggregate([
                { $match: { cityGridId: gridId, price: { $lte: currentBudget } } },
                { $sort: { price: 1 } },
                { $limit: 4 },
                { $project: { reviews: 0, user: 0, latitude: 0, longitude: 0, gridId: 0, cityGridId: 0, __v: 0 } }
            ]),
            Activity.find({ cityGridId: gridId })
                .select('-reviews -user -latitude -longitude -gridId -cityGridId -__v')
                .limit(4)
        ]);

        console.timeEnd(`Parallel_Fetch_${gridId}`);
        return { stays, activities };
    };

    console.time("Path_Traversal_Loop");
    // 1. Traverse path route
    for (let i = 1; i < path.length; i++) {
        const prevGrid = corridorMap.get(path[i - 1]);
        const currGrid = corridorMap.get(path[i]);

        const stepDist = calculateDistance(prevGrid.centerLat, prevGrid.centerLon, currGrid.centerLat, currGrid.centerLon);

        // If taking this step exceeds the day's physical driving limit
        if (currentDayDist + stepDist > maxKmPerDay && currentDayDist > 0) {
            const stopoverGridId = path[i - 1];

            const { stays, activities } = await fetchStaysAndActivities(stopoverGridId);

            if (stays.length === 0) {
                warningMessage = `Budget is too low or stays unavailable. Stopped itinerary planning at day ${dayCounter}. Remaining budget: ₹${currentBudget === Infinity ? 'Unlimited' : currentBudget}`;
                break;
            }

            // Deduct the minimum stay cost from remaining budget
            currentBudget -= stays[0].price;

            days.push({
                dayIndex: dayCounter,
                startLocation: corridorMap.get(path[lastStopoverIdx])?.city || 'Start',
                endLocation: prevGrid.city,
                stopoverGridId: stopoverGridId,
                distanceCovered: Math.floor(currentDayDist),
                stays: stays,
                activities: activities
            });

            currentDayDist = 0;
            lastStopoverIdx = i - 1;
            dayCounter++;
        }

        // Now mathematically execute the step into the NEW day (or ongoing day)
        currentDayDist += stepDist;

        // If we have finally arrived at the destination on the final node!
        if (i === path.length - 1 && !warningMessage) {
            const stopoverGridId = path[i];

            const { stays, activities } = await fetchStaysAndActivities(stopoverGridId);

            if (stays.length === 0) {
                warningMessage = `Budget is too low or stays unavailable at destination. Stopped itinerary planning at day ${dayCounter}. Remaining budget: ₹${currentBudget === Infinity ? 'Unlimited' : currentBudget}`;
                break;
            }

            currentBudget -= stays[0].price;

            days.push({
                dayIndex: dayCounter,
                startLocation: corridorMap.get(path[lastStopoverIdx])?.city || 'Start',
                endLocation: currGrid.city,
                stopoverGridId: stopoverGridId,
                distanceCovered: Math.floor(currentDayDist),
                stays: stays,
                activities: activities
            });

            currentDayDist = 0;
            lastStopoverIdx = i;
            dayCounter++;
        }
    }
    console.timeEnd("Path_Traversal_Loop");

    console.time("Extend_Days_Loop");
    // 2. Extend days at destination if targetDays specified AND no warnings yet
    if (!warningMessage && targetDays && dayCounter <= targetDays) {
        const finalGridId = path[path.length - 1]; // destination grid
        const finalGrid = corridorMap.get(finalGridId);
        const finalCity = finalGrid ? finalGrid.city : 'Destination';

        while (dayCounter <= targetDays) {
            const { stays, activities } = await fetchStaysAndActivities(finalGridId);

            if (stays.length === 0) {
                warningMessage = `Budget exhausted or no stays available. Could not plan all ${targetDays} days. Stopped at day ${dayCounter - 1}.`;
                break; // Break the while loop
            }

            currentBudget -= stays[0].price;

            days.push({
                dayIndex: dayCounter,
                startLocation: finalCity,
                endLocation: finalCity,
                stopoverGridId: finalGridId,
                distanceCovered: 0, // No physical travel on extended stay days
                stays: stays,
                activities: activities
            });
            dayCounter++;
        }
    }
    console.timeEnd("Extend_Days_Loop");
    console.timeEnd("Segment_Total_Time");

    return {
        days: days,
        message: warningMessage
    };
};