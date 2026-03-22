require("dotenv").config();
const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true, // Upstash ke liye TLS zaroori hai
        rejectUnauthorized: false
    }
});

client.on('error', (err) => console.log('❌ Redis Client Error:', err.message));
client.on('connect', () => console.log('🚀 Redis Connected Successfully'));

// IIFE to handle connection
(async () => {
    try {
        await client.connect();
    } catch (err) {
        console.error("❌ Redis Connection Failed:", err);
    }
})();

module.exports = client;