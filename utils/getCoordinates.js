const axios = require('axios');

const getCoordinates = async (location) => {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)}&format=json&limit=1`,
            { 
                headers: { 'User-Agent': 'TripLinker-Student-Project' },
                timeout: 3000 
            }
        );
        if (response.data && response.data.length > 0) {
            return {
                lat: response.data[0].lat,
                lon: response.data[0].lon
            };
        }
    } catch (err) {
        console.error("Geocoding helper error:", err.message);
    }
    return null;
};

module.exports = getCoordinates;