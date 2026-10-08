import { createHash, randomUUID } from "node:crypto";
import jwt from "jsonwebtoken";
import redisClient from "../config/redis.js";

const accessTokenLifetime = "15m";
const refreshTokenLifetimeSeconds = 7 * 24 * 60 * 60;
const refreshTokenCookieName = "refreshToken";

const getAccessSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET must be configured");
  }
  return process.env.JWT_SECRET;
};

const getRefreshSecret = () => {
  if (!process.env.JWT_REFRESH_SECRET) {
    throw new Error("JWT_REFRESH_SECRET must be configured");
  }
  return process.env.JWT_REFRESH_SECRET;
};

export const validateAuthConfiguration = () => {
  const accessSecret = getAccessSecret();
  const refreshSecret = getRefreshSecret();
  if (accessSecret === refreshSecret) {
    throw new Error("JWT_SECRET and JWT_REFRESH_SECRET must be different");
  }
};

const hashToken = (token) =>
  createHash("sha256").update(token).digest("hex");

const refreshSessionKey = (jti) => `auth:refresh:${jti}`;

const consumeRefreshSession = async (jti, token) => {
  const result = await redisClient.eval(
    "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) else return 0 end",
    {
      keys: [refreshSessionKey(jti)],
      arguments: [hashToken(token)],
    }
  );

  return result === 1;
};

export const createTokenPair = async ({ id, role }) => {
  const accessToken = jwt.sign({ id, role }, getAccessSecret(), {
    expiresIn: accessTokenLifetime,
  });
  const jti = randomUUID();
  const refreshToken = jwt.sign({ id, role, jti }, getRefreshSecret(), {
    expiresIn: refreshTokenLifetimeSeconds,
  });

  await redisClient.set(refreshSessionKey(jti), hashToken(refreshToken), {
    EX: refreshTokenLifetimeSeconds,
  });
  return { accessToken, refreshToken };
};

export const setRefreshTokenCookie = (res, role, refreshToken) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie(refreshTokenCookieName, refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: refreshTokenLifetimeSeconds * 1000,
    path: `/api/${role}`,
  });
};

export const clearRefreshTokenCookie = (res, role) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.clearCookie(refreshTokenCookieName, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: `/api/${role}`,
  });
};

export const issueAuthTokens = async (res, { id, role }) => {
  const { accessToken, refreshToken } = await createTokenPair({ id, role });
  setRefreshTokenCookie(res, role, refreshToken);

  return {
    success: true,
    token: accessToken,
    expiresIn: 15 * 60,
  };
};

export const rotateRefreshToken = async (req, res, role) => {
  const refreshToken = req.cookies?.[refreshTokenCookieName];
  if (!refreshToken) {
    clearRefreshTokenCookie(res, role);
    return { status: 401, body: { success: false, message: "Refresh token required" } };
  }

  let payload;
  try {
    payload = jwt.verify(refreshToken, getRefreshSecret());
  } catch {
    clearRefreshTokenCookie(res, role);
    return { status: 401, body: { success: false, message: "Invalid refresh token" } };
  }

  if (
    typeof payload === "string" ||
    payload.role !== role ||
    typeof payload.id !== "string" ||
    typeof payload.jti !== "string"
  ) {
    clearRefreshTokenCookie(res, role);
    return { status: 401, body: { success: false, message: "Invalid refresh token" } };
  }

  const sessionConsumed = await consumeRefreshSession(payload.jti, refreshToken);
  if (!sessionConsumed) {
    clearRefreshTokenCookie(res, role);
    return { status: 401, body: { success: false, message: "Refresh token expired or revoked" } };
  }

  const response = await issueAuthTokens(res, { id: payload.id, role });
  return { status: 200, body: response };
};

export const revokeRefreshToken = async (req, role) => {
  const refreshToken = req.cookies?.[refreshTokenCookieName];
  if (!refreshToken) return;

  try {
    const payload = jwt.verify(refreshToken, getRefreshSecret());
    if (
      typeof payload !== "string" &&
      payload.role === role &&
      typeof payload.jti === "string"
    ) {
      await consumeRefreshSession(payload.jti, refreshToken);
    }
  } catch (error) {
    if (error.name !== "JsonWebTokenError" && error.name !== "TokenExpiredError") {
      throw error;
    }
  }
};
