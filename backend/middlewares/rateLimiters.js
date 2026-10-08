import { rateLimit } from "express-rate-limit";
import { RedisStore } from "rate-limit-redis";
import redisClient from "../config/redis.js";

const createRedisStore = (prefix) =>
  new RedisStore({
    prefix,
    sendCommand: (...args) => redisClient.sendCommand(args),
  });

const limitResponse = {
  success: false,
  message: "Too many requests. Please try again later.",
};

let apiLimiter;
let authLimiter;

export const initializeRateLimiters = () => {
  apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 120,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRedisStore("rate-limit:api:"),
    message: limitResponse,
  });

  authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    store: createRedisStore("rate-limit:auth:"),
    message: limitResponse,
  });
};

export const apiRateLimiter = (req, res, next) => {
  if (!apiLimiter) {
    return next(new Error("API rate limiter has not been initialized"));
  }
  return apiLimiter(req, res, next);
};

export const authRateLimiter = (req, res, next) => {
  if (!authLimiter) {
    return next(new Error("Authentication rate limiter has not been initialized"));
  }
  return authLimiter(req, res, next);
};
