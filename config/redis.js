import "dotenv/config";
import redis from 'redis';

const client = redis.createClient({
    url: process.env.REDIS_URL,
    socket: {
        tls: true,
        rejectUnauthorized: false
    }
});

client.on('error', (err) => console.log('❌ Redis Client Error:', err.message));
client.on('connect', () => console.log('🚀 Redis Connected Successfully'));

// IIFE to handle connection
try {
    await client.connect();
} catch (err) {
    console.error("❌ Redis Connection Failed:", err);
}

export default client;