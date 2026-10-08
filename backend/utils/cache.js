import redisClient from "../config/redis.js";

const inFlightLoads = new Map();

const logCacheSource = (req, source, detail) => {
  console.info(
    `[Cache] ${req.method} ${req.path} source=${source}${detail ? ` (${detail})` : ""}`
  );
};

export const logDatabaseAccess = (req, operation = "read") => {
  logCacheSource(req, "MongoDB", operation);
};

export const getCachedData = async (
  req,
  { namespace, key, ttlSeconds },
  loadFromDatabase
) => {
  let cacheKey;
  let cacheAvailable = true;

  try {
    const version =
      (await redisClient.get(`cache:version:${namespace}`)) || "0";
    cacheKey = `cache:${namespace}:${version}:${key}`;

    const cachedValue = await redisClient.get(cacheKey);
    if (cachedValue !== null) {
      try {
        const cachedData = JSON.parse(cachedValue);
        logCacheSource(req, "Redis");
        return cachedData;
      } catch (error) {
        console.warn(
          `[Cache] Invalid cached value for ${namespace}; loading from MongoDB (${error.name})`
        );
        await redisClient.del(cacheKey);
      }
    }
  } catch (error) {
    cacheAvailable = false;
    console.warn(
      `[Cache] Redis read failed; loading from MongoDB (${error.name})`
    );
  }

  const loadKey = cacheKey || `uncached:${namespace}:${key}`;
  let pendingLoad = inFlightLoads.get(loadKey);
  logCacheSource(
    req,
    "MongoDB",
    pendingLoad
      ? "shared in-flight load"
      : cacheAvailable
        ? "Redis miss"
        : "Redis unavailable"
  );
  if (!pendingLoad) {
    pendingLoad = (async () => {
      const data = await loadFromDatabase();
      if (cacheAvailable) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(data), {
            EX: ttlSeconds,
          });
          logCacheSource(req, "Redis", "cache write");
        } catch (error) {
          console.warn(
            `[Cache] Redis write failed for ${namespace} (${error.name})`
          );
        }
      }
      return data;
    })();
    inFlightLoads.set(loadKey, pendingLoad);
  }

  try {
    return await pendingLoad;
  } finally {
    if (inFlightLoads.get(loadKey) === pendingLoad) {
      inFlightLoads.delete(loadKey);
    }
  }
};

export const invalidateCache = async (req, ...namespaces) => {
  for (const namespace of new Set(namespaces)) {
    try {
      await redisClient.incr(`cache:version:${namespace}`);
      logCacheSource(req, "Redis", `invalidated ${namespace}`);
    } catch (error) {
      console.error(
        `[Cache] ${req.method} ${req.path} failed to invalidate ${namespace}; entries expire by TTL (${error.name})`
      );
    }
  }
};
