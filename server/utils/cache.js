/**
 * Simple in-memory cache with TTL
 */
class Cache {
  constructor(ttl = 1800000) { // 30 minutes default
    this.cache = new Map();
    this.ttl = ttl;
  }

  /**
   * Normalize address for consistent cache keys
   */
  normalizeKey(address) {
    return address
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[.,]/g, '');
  }

  /**
   * Get cached value
   */
  get(key) {
    const normalizedKey = this.normalizeKey(key);
    const item = this.cache.get(normalizedKey);

    if (!item) return null;

    // Check if expired
    if (Date.now() > item.expiry) {
      this.cache.delete(normalizedKey);
      return null;
    }

    console.log(`Cache HIT: ${normalizedKey}`);
    return item.value;
  }

  /**
   * Set cached value
   */
  set(key, value) {
    const normalizedKey = this.normalizeKey(key);
    this.cache.set(normalizedKey, {
      value,
      expiry: Date.now() + this.ttl
    });
    console.log(`Cache SET: ${normalizedKey}`);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
    console.log('Cache cleared');
  }

  /**
   * Get cache stats
   */
  stats() {
    const now = Date.now();
    const valid = Array.from(this.cache.values()).filter(item => item.expiry > now).length;
    const expired = this.cache.size - valid;

    return {
      total: this.cache.size,
      valid,
      expired
    };
  }
}

module.exports = Cache;
