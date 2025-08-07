// Advanced caching layer for government grants and procurement directory

type CacheEntry<T> = {
  data: T;
  timestamp: number;
  ttl: number;
  key: string;
};

type CacheOptions = {
  ttl?: number; // Time to live in seconds
  staleWhileRevalidate?: number; // Additional time to serve stale data
  tags?: string[]; // Cache tags for invalidation
};

class AdvancedCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 3600; // 1 hour default

  // Standard get operation
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) return null;

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    // Check if expired
    if (age > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  // Get with stale-while-revalidate support
  getWithSWR<T>(key: string): { data: T | null; isStale: boolean } {
    const entry = this.cache.get(key);

    if (!entry) return { data: null, isStale: false };

    const now = Date.now();
    const age = (now - entry.timestamp) / 1000;

    // If within TTL, return fresh data
    if (age <= entry.ttl) {
      return { data: entry.data, isStale: false };
    }

    // If within SWR window, return stale data
    const swrWindow = entry.ttl + entry.ttl * 0.5; // 50% additional time
    if (age <= swrWindow) {
      return { data: entry.data, isStale: true };
    }

    // Expired, remove and return null
    this.cache.delete(key);
    return { data: null, isStale: false };
  }

  // Set with options
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || this.defaultTTL;

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      key,
    };

    this.cache.set(key, entry);
  }

  // Delete specific key
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  // Clear cache by tags
  clearByTags(tags: string[]): number {
    let cleared = 0;
    for (const [key, entry] of Array.from(this.cache.entries())) {
      // For now, we'll implement simple tag matching
      // In production, you might want more sophisticated tagging
      if (tags.some((tag) => key.includes(tag))) {
        this.cache.delete(key);
        cleared++;
      }
    }
    return cleared;
  }

  // Clear expired entries
  clearExpired(): number {
    const now = Date.now();
    let cleared = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      const age = (now - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        this.cache.delete(key);
        cleared++;
      }
    }

    return cleared;
  }

  // Get cache statistics
  getStats() {
    const now = Date.now();
    let totalEntries = 0;
    let expiredEntries = 0;
    let totalSize = 0;

    for (const [key, entry] of Array.from(this.cache.entries())) {
      totalEntries++;
      const age = (now - entry.timestamp) / 1000;
      if (age > entry.ttl) {
        expiredEntries++;
      }
      totalSize += JSON.stringify(entry).length;
    }

    return {
      totalEntries,
      expiredEntries,
      activeEntries: totalEntries - expiredEntries,
      totalSizeBytes: totalSize,
      hitRate: 0, // Would need to track hits/misses for real hit rate
    };
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const cache = new AdvancedCache();

// Utility function for memoization with cache
export function memoize<TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: CacheOptions & { keyFn?: (...args: TArgs) => string } = {},
) {
  const { keyFn = (...args) => JSON.stringify(args), ...cacheOptions } =
    options;

  return async (...args: TArgs): Promise<TReturn> => {
    const key = `memoize:${fn.name}:${keyFn(...args)}`;

    // Try to get from cache with SWR
    const { data, isStale } = cache.getWithSWR<TReturn>(key);

    if (data && !isStale) {
      return data;
    }

    // If stale, return stale data but trigger background refresh
    if (data && isStale) {
      // Background refresh (don't await)
      fn(...args)
        .then((freshData) => {
          cache.set(key, freshData, cacheOptions);
        })
        .catch(console.error);

      return data;
    }

    // No data, fetch fresh
    const result = await fn(...args);
    cache.set(key, result, cacheOptions);
    return result;
  };
}

// Cache key generators for different data types
export const CacheKeys = {
  opportunity: (id: string) => `opportunity:${id}`,
  opportunitySearch: (params: Record<string, any>) =>
    `search:${JSON.stringify(params)}`,
  grants: (filters?: Record<string, any>) =>
    `grants:${filters ? JSON.stringify(filters) : "all"}`,
  contracts: (filters?: Record<string, any>) =>
    `contracts:${filters ? JSON.stringify(filters) : "all"}`,
  agencies: () => "agencies:all",
  categories: () => "categories:all",
  stats: (type?: string) => `stats:${type || "all"}`,
  sitemap: () => "sitemap:main",
  feed: () => "feed:main",
};

// Predefined cache configurations
export const CacheConfigs = {
  // Short-lived for real-time data
  realtime: { ttl: 300 }, // 5 minutes

  // Standard for search results
  search: { ttl: 1800 }, // 30 minutes

  // Longer for stable data
  stable: { ttl: 3600 }, // 1 hour

  // Long-lived for rarely changing data
  longTerm: { ttl: 86400 }, // 24 hours

  // Static content
  static: { ttl: 604800 }, // 1 week
};

// Cache warming utilities
export class CacheWarmer {
  static async warmOpportunityCache(opportunityIds: string[]) {
    // This would warm the cache with opportunity data
    console.log(`Warming cache for ${opportunityIds.length} opportunities`);
  }

  static async warmSearchCache(commonSearches: Record<string, any>[]) {
    // This would warm the cache with common search results
    console.log(`Warming cache for ${commonSearches.length} common searches`);
  }
}

// Cleanup task that runs periodically
export function startCacheCleanup() {
  // Clean up expired entries every 10 minutes
  setInterval(
    () => {
      const cleared = cache.clearExpired();
      if (cleared > 0) {
        console.log(`Cache cleanup: removed ${cleared} expired entries`);
      }
    },
    10 * 60 * 1000,
  );
}
