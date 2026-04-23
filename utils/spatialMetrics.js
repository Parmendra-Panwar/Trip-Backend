export const getNeighborGrids = (gridId, layers = 2) => {
    // Expected format: "LAT2325LON7741"
    const match = gridId.match(/LAT(-?\d+)LON(-?\d+)/);
    if (!match) return [gridId];

    const lat = parseInt(match[1]);
    const lon = parseInt(match[2]);
    const neighbors = [];

    // layers = 2 means a 5x5 grid (25 grids total)
    for (let i = -layers; i <= layers; i++) {
        for (let j = -layers; j <= layers; j++) {
            const latStr = String(lat + i).padStart(4, '0');
            const lonStr = String(lon + j).padStart(5, '0');
            neighbors.push(`LAT${latStr}LON${lonStr}`);
        }
    }
    return neighbors;
};

export const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};