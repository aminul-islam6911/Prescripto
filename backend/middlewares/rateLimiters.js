import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

const createRedisStore = (prefix) =>
  new RedisStore({
    prefix,
    sendCommand: async (...args) => {
      const result = await redisClient.sendCommand(args);
      console.info(`[Redis] Rate limit command: ${args[0]}`);
      return result;
    },
  });

const limitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

const createRateLimiter = (prefix, limit) => {
  let limiter;

  return (req, res, next) => {
    limiter ??= rateLimit({
      windowMs: 15 * 60 * 1000,
      limit,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      store: createRedisStore(prefix),
      message: limitResponse,
    });

    return limiter(req, res, next);
  };
};

export const apiRateLimiter = createRateLimiter("rate-limit:api:", 120);
export const authRateLimiter = createRateLimiter("rate-limit:auth:", 10);
