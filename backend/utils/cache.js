import redisClient from "../config/redis.js";

const inFlightLoads = new Map();

export const getCachedData = async (
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
  if (!pendingLoad) {
    pendingLoad = (async () => {
      const data = await loadFromDatabase();
      if (cacheAvailable) {
        try {
          await redisClient.set(cacheKey, JSON.stringify(data), {
            EX: ttlSeconds,
          });
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

export const invalidateCache = async (...namespaces) => {
  for (const namespace of new Set(namespaces)) {
    try {
      await redisClient.incr(`cache:version:${namespace}`);
    } catch (error) {
      console.error(
        `[Cache] Failed to invalidate ${namespace}; entries expire by TTL (${error.name})`
      );
    }
  }
};
