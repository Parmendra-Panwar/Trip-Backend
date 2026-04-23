import { calculateDistance } from "./spatialMetrics.js";

// Pass maxKmPerDay into the function
export const findPath = (startGridId, destGridId, corridorMap, destCoords, maxKmPerDay) => {
    // Performance Fix: Pre-compute destination distance for all nodes
    // This saves millions of calculateDistance trig operations inside the loop
    for (let [id, grid] of corridorMap.entries()) {
        // Safe check for lat/lon presence
        if (grid.centerLat !== undefined && grid.centerLon !== undefined) {
            grid.distToDest = calculateDistance(grid.centerLat, grid.centerLon, destCoords.lat, destCoords.lon);
        } else {
            grid.distToDest = Infinity; // Failsafe
        }
    }

    const openSet = new Set([startGridId]);
    const cameFrom = new Map();

    const gScore = new Map();
    gScore.set(startGridId, 0);

    const fScore = new Map();
    fScore.set(startGridId, 0);

    let loopSafety = 0; // Prevent server hangs forever

    while (openSet.size > 0 && loopSafety < 5000) {
        loopSafety++;

        let current = null;
        let lowestF = Infinity;

        // Find the node with the lowest F score
        for (let nodeId of openSet) {
            const score = fScore.get(nodeId);
            // Ignore NaN explicitly to prevent infinite loop bugs!
            if (score !== undefined && !isNaN(score) && score < lowestF) {
                lowestF = score;
                current = nodeId;
            }
        }

        // If math broke and current is still null, break the loop
        if (!current) break;

        // Path Found!
        if (current === destGridId) {
            const path = [current];
            let pathSafety = 0;
            while (cameFrom.has(current) && pathSafety < 5000) {
                pathSafety++;
                current = cameFrom.get(current);
                path.unshift(current);
            }
            return path;
        }

        openSet.delete(current);
        const currentGrid = corridorMap.get(current);
        if (!currentGrid) continue;

        const currentToDestDist = currentGrid.distToDest || calculateDistance(currentGrid.centerLat, currentGrid.centerLon, destCoords.lat, destCoords.lon);

        // THE JUMP LOGIC: Instead of 8 adjacent physical grids, 
        // we check all grids in our corridor map to see if we can jump to them today.
        const maxRange = Number(maxKmPerDay) || 500;

        for (let [neighborId, neighborGrid] of corridorMap.entries()) {
            if (neighborId === current) continue;
            
            const neighborToDestDist = neighborGrid.distToDest;
            
            // 1. Performance limit: Don't evaluate full jump if the neighbor goes massively backwards.
            // This prevents O(N^2) graph fan-out that hangs the server on large maxRange values.
            if (neighborToDestDist > currentToDestDist + (maxRange * 0.5)) {
                continue; 
            }

            const distToNeighbor = calculateDistance(currentGrid.centerLat, currentGrid.centerLon, neighborGrid.centerLat, neighborGrid.centerLon);

            // 2. Can we drive there today? Ensure maxKmPerDay is a valid number.
            if (distToNeighbor <= maxRange) {

                const tentativeGScore = gScore.get(current) + distToNeighbor;
                const currentNeighborGScore = gScore.has(neighborId) ? gScore.get(neighborId) : Infinity;

                if (tentativeGScore < currentNeighborGScore) {
                    cameFrom.set(neighborId, current);
                    gScore.set(neighborId, tentativeGScore);

                    // F-Score = Distance traveled + estimated distance to destination
                    fScore.set(neighborId, tentativeGScore + neighborToDestDist);

                    if (!openSet.has(neighborId)) openSet.add(neighborId);
                }
            }
        }
    }
    return []; // No path found
};