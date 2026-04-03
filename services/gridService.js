const Grid = require('../models/grid');
const CityGrid = require('../models/CityGrid');

const { calculateGridId, calculateCityGridId } = require('../utilss/gridIdGenerator');

module.exports.syncGridMetadata = async (doc, type) => {
    if (!doc.latitude || !doc.longitude) return null;

    const gId = calculateGridId(doc.latitude, doc.longitude);
    const cgId = calculateCityGridId(doc.latitude, doc.longitude);
    const city = doc.location ? doc.location.split(',').shift().trim() : "Unknown"; // Take first part for city name usually better

    const isListing = type === 'listing';
    
    // Updates for Grid
    const gridUpdate = isListing 
        ? { $inc: { listingCount: 1 }, $min: { minPriceStay: doc.price || Infinity }, $setOnInsert: { city: city } }
        : { $inc: { activityCount: 1 }, $setOnInsert: { city: city } };

    // Updates for CityGrid
    // Math.round to avoid float precision drops
    const cLat = Math.floor(Math.round(doc.latitude * 1000) / 100) / 10;
    const cLon = Math.floor(Math.round(doc.longitude * 1000) / 100) / 10;
    const cityGridUpdate = isListing
        ? { $inc: { listingCount: 1 }, $min: { minPriceStay: doc.price || Infinity }, $setOnInsert: { city: city, centerLat: cLat, centerLon: cLon } }
        : { $inc: { activityCount: 1 }, $setOnInsert: { city: city, centerLat: cLat, centerLon: cLon } };

    try {
        await Grid.findOneAndUpdate({ gridId: gId }, gridUpdate, { upsert: true, new: true });
        await CityGrid.findOneAndUpdate({ cityGridId: cgId }, cityGridUpdate, { upsert: true, new: true });
        
        return { gridId: gId, cityGridId: cgId };
    } catch (err) {
        console.error("Error updating Grid Metadata:", err);
        return { gridId: gId, cityGridId: cgId }; 
    }
};

module.exports.removeGridMetadata = async (doc, type) => {
    if (!doc.gridId || !doc.cityGridId) return;

    const isListing = type === 'listing';
    
    // Decrements
    const gridUpdate = isListing ? { $inc: { listingCount: -1 } } : { $inc: { activityCount: -1 } };
    const cityGridUpdate = isListing ? { $inc: { listingCount: -1 } } : { $inc: { activityCount: -1 } };

    try {
        const updatedGrid = await Grid.findOneAndUpdate({ gridId: doc.gridId }, gridUpdate, { new: true });
        if (updatedGrid && updatedGrid.listingCount <= 0 && updatedGrid.activityCount <= 0) {
            await Grid.deleteOne({ _id: updatedGrid._id });
        }

        const updatedCityGrid = await CityGrid.findOneAndUpdate({ cityGridId: doc.cityGridId }, cityGridUpdate, { new: true });
        if (updatedCityGrid && updatedCityGrid.listingCount <= 0 && updatedCityGrid.activityCount <= 0) {
            await CityGrid.deleteOne({ _id: updatedCityGrid._id });
        }
    } catch (err) {
        console.error("Error removing Grid Metadata:", err);
    }
};