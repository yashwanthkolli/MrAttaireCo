const NodeCache = require('node-cache');

// Main cache instance
const cache = new NodeCache({
  stdTTL: 3600, // Default TTL 1 hour
  checkperiod: 600 // Check for expired items every 10 minutes
});

// Rate limit cache (for API calls)
const rateLimitCache = new NodeCache({
  stdTTL: 60, // 1 minute TTL
  deleteOnExpire: true
});

module.exports = {
  cache,
  rateLimitCache,
  get: (key) => cache.get(key),
  set: (key, value, ttl) => cache.set(key, value, ttl),
  del: (key) => cache.del(key),
  flush: () => cache.flushAll(),
  wrap: async (key, ttl, fetchFn) => {
    const cached = cache.get(key);
    if (cached) return cached;
    
    const result = await fetchFn();
    cache.set(key, result, ttl);
    return result;
  }
};