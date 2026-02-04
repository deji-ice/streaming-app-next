import { LRUCache } from 'lru-cache';

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
    TRENDING: 5 * 60 * 1000,        // 5 minutes
    POPULAR: 10 * 60 * 1000,        // 10 minutes
    DETAILS: 60 * 60 * 1000,        // 1 hour
    SEARCH: 30 * 60 * 1000,         // 30 minutes
    RECOMMENDATIONS: 30 * 60 * 1000, // 30 minutes
    GENRES: 24 * 60 * 60 * 1000,    // 24 hours
    SEASON: 60 * 60 * 1000,         // 1 hour
} as const;

// LRU Cache configuration
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const cache = new LRUCache<string, any>({
    max: 500, // Maximum 500 items
    ttl: 30 * 60 * 1000, // Default TTL: 30 minutes
    updateAgeOnGet: true, // Refresh TTL on cache hit
    updateAgeOnHas: false,
});

// Request queue for throttling
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface QueuedRequest<T = any> {
    key: string;
    fetcher: () => Promise<T>;
    resolve: (value: T) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason: any) => void;
    timestamp: number;
}

class RequestThrottler {
    private queue: QueuedRequest[] = [];
    private processing = false;
    private requestCount = 0;
    private windowStart = Date.now();

    // TMDB rate limit: 40 requests per 10 seconds
    private readonly MAX_REQUESTS = 38; // Slightly under limit for safety
    private readonly WINDOW_MS = 10 * 1000; // 10 seconds

    async enqueue<T>(
        key: string,
        fetcher: () => Promise<T>
    ): Promise<T> {
        // Check cache first
        const cached = cache.get(key);
        if (cached !== undefined) {
            return cached as T;
        }

        // Create promise for this request
        return new Promise<T>((resolve, reject) => {
            this.queue.push({
                key,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                fetcher: fetcher as () => Promise<any>,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                resolve: resolve as (value: any) => void,
                reject,
                timestamp: Date.now(),
            });

            if (!this.processing) {
                this.processQueue();
            }
        });
    }

    private async processQueue() {
        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();

            // Reset window if 10 seconds have passed
            if (now - this.windowStart >= this.WINDOW_MS) {
                this.requestCount = 0;
                this.windowStart = now;
            }

            // If we've hit the limit, wait until window resets
            if (this.requestCount >= this.MAX_REQUESTS) {
                const waitTime = this.WINDOW_MS - (now - this.windowStart);
                if (waitTime > 0) {
                    await new Promise(resolve => setTimeout(resolve, waitTime));
                    this.requestCount = 0;
                    this.windowStart = Date.now();
                }
            }

            // Process next request
            const request = this.queue.shift();
            if (!request) break;

            try {
                // Check cache again (another request might have populated it)
                const cached = cache.get(request.key);
                if (cached !== undefined) {
                    request.resolve(cached);
                    continue;
                }

                // Make the actual request
                this.requestCount++;
                const result = await request.fetcher();

                // Cache the result
                cache.set(request.key, result);

                request.resolve(result);
            } catch (error) {
                request.reject(error);
            }
        }

        this.processing = false;
    }
}

// Singleton throttler instance
const throttler = new RequestThrottler();

/**
 * Cached fetch with request throttling
 * @param key - Unique cache key
 * @param fetcher - Function that makes the API request
 * @param ttl - Time to live in milliseconds (optional)
 */
export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>
): Promise<T> {
    return throttler.enqueue(key, fetcher);
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
    cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
    cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
    return {
        size: cache.size,
        maxSize: cache.max,
        calculatedSize: cache.calculatedSize,
    };
}

/**
 * Generate cache keys for different TMDB endpoints
 */
export const cacheKeys = {
    trending: () => 'tmdb:trending',
    popularMovies: () => 'tmdb:popular:movies',
    popularSeries: () => 'tmdb:popular:series',
    trendingSeries: () => 'tmdb:trending:series',
    latestMovies: (sortBy: string) => `tmdb:latest:movies:${sortBy}`,
    latestSeries: (sortBy: string) => `tmdb:latest:series:${sortBy}`,
    movieDetails: (id: string) => `tmdb:movie:${id}`,
    seriesDetails: (id: string) => `tmdb:series:${id}`,
    search: (query: string) => `tmdb:search:${query.toLowerCase()}`,
    recommendations: (id: number, type: string) => `tmdb:recommendations:${type}:${id}`,
    genres: () => 'tmdb:genres',
    season: (seriesId: number, seasonNumber: number) => `tmdb:season:${seriesId}:${seasonNumber}`,
    trailers: (id: number, type: string) => `tmdb:trailers:${type}:${id}`,
} as const;
