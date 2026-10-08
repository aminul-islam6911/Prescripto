import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on("error", (error) => {
  console.error("Redis client error:", error);
});

export const connectRedis = async () => {
  if (!process.env.REDIS_URL) {
    throw new Error("REDIS_URL must be configured");
  }

  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
};

export default redisClient;
