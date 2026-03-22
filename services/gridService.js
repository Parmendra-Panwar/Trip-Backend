const Grid = require('../models/grid');

// Grid ID Generator
const calculateGridId = (lat, lon) => {
    const latGrid = Math.floor(lat * 100);
    const lonGrid = Math.floor(lon * 100);
    return `LAT${latGrid}LON${lonGrid}`;
};

module.exports.syncGridMetadata = async (doc, type) => {
    if (!doc.latitude || !doc.longitude) return null;

    const gId = calculateGridId(doc.latitude, doc.longitude);
    const city = doc.location ? doc.location.split(',').pop().trim() : "Unknown";

    const updateObj = type === 'listing'
        ? { $inc: { listingCount: 1 }, $min: { minPriceStay: doc.price || Infinity } }
        : { $inc: { activityCount: 1 } };

    try {
        await Grid.findOneAndUpdate(
            { gridId: gId },
            { 
                ...updateObj, 
                city: city 
            },
            { upsert: true, new: true }
        );
        
        return gId;
    } catch (err) {
        console.error("Error updating Grid Metadata:", err);
        return gId; 
    }
};