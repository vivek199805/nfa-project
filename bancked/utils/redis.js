
import { createClient } from "redis";

let redisClient = null;

const getRedisClient = async () => {
  if (!redisClient) {
    redisClient = createClient({
      url: process.env.REDIS_URL // e.g. redis://localhost:6379
    });

    redisClient.on("error", err => console.error("Redis Error:", err));

    await redisClient.connect();
  }
  return redisClient;
};

export default getRedisClient;
