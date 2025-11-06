// Redis.js

const redis = require("redis");
const RedisStore = require("connect-redis").default;
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
});

redisClient.connect().catch(console.error);

let redisStore = new RedisStore({
    client: redisClient,
});

module.exports = { redisStore, redisClient }; // Export redisStore