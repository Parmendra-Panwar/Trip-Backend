const redisClient = require('../config/redis');

module.exports.invalidateNearbyCache = async (itemId) => {
    try {
        const keys = [ `nearby:activity:${itemId}`, `nearby:listing:${itemId}` ];
        
        await Promise.all(keys.map(key => redisClient.del(key)));
    } catch (err) {
        console.error("❌ Redis Invalidation Error:", err.message);
    }
};