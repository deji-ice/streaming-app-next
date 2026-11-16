import type {
  CacheEntryType,
  CacheValue,
  IncrementalCache,
  WithLastModified,
} from "@opennextjs/aws/types/overrides.js";

/**
 * OpenNext incremental cache that lives in the memory of one Worker isolate.
 *
 * Why not Workers KV: KV bills per operation and per GB stored. On a paid account there
 * is no daily cap, so crawlers walking thousands of unique /person and /movie pages
 * wrote several entries each (24.9M writes, 96M reads and 303 GB of never-expiring
 * entries in 10 days). This cache costs nothing, cannot grow past MAX_BYTES, and forgets
 * everything when the isolate recycles.
 *
 * Rules that keep it cheap and quiet:
 * - Entries expire hard. An expired entry is a miss, never a stale hit. Serving stale
 *   would make Next queue a background revalidation (a second full render through the
 *   Durable Object queue), and the result of that render would land in a different
 *   isolate's memory anyway.
 * - Total size is capped and the oldest entries are evicted first.
 * - Entries bigger than MAX_ENTRY_BYTES are not kept.
 */

const MAX_BYTES = 24 * 1024 * 1024;
const MAX_ENTRY_BYTES = 1024 * 1024;
const MIN_TTL_SECONDS = 60;
const MAX_TTL_SECONDS = 6 * 60 * 60;
const DEFAULT_TTL_SECONDS = 10 * 60;

type Entry = { value: unknown; lastModified: number; expiresAt: number; bytes: number };

class MemoryIncrementalCache implements IncrementalCache {
  readonly name = "memory-incremental-cache";

  // Map keeps insertion order, so the first key is always the oldest entry.
  private readonly entries = new Map<string, Entry>();
  private totalBytes = 0;

  async get<CacheType extends CacheEntryType = "cache">(
    key: string,
    cacheType?: CacheType,
  ): Promise<WithLastModified<CacheValue<CacheType>> | null> {
    const id = this.id(key, cacheType);
    const entry = this.entries.get(id);
    if (!entry) return null;
    if (entry.expiresAt <= Date.now()) {
      this.remove(id);
      return null;
    }
    return { value: entry.value as CacheValue<CacheType>, lastModified: entry.lastModified };
  }

  async set<CacheType extends CacheEntryType = "cache">(
    key: string,
    value: CacheValue<CacheType>,
    cacheType?: CacheType,
  ): Promise<void> {
    const bytes = JSON.stringify(value)?.length ?? 0;
    const id = this.id(key, cacheType);
    this.remove(id);
    if (bytes > MAX_ENTRY_BYTES) return;

    const now = Date.now();
    const revalidate = (value as { revalidate?: unknown }).revalidate;
    const ttl = typeof revalidate === "number" && revalidate > 0 ? revalidate : DEFAULT_TTL_SECONDS;
    const ttlSeconds = Math.min(Math.max(ttl, MIN_TTL_SECONDS), MAX_TTL_SECONDS);

    this.entries.set(id, { value, lastModified: now, expiresAt: now + ttlSeconds * 1000, bytes });
    this.totalBytes += bytes;

    for (const oldest of this.entries.keys()) {
      if (this.totalBytes <= MAX_BYTES) break;
      this.remove(oldest);
    }
  }

  async delete(key: string): Promise<void> {
    // Next only deletes ISR page entries, which are stored as the default type.
    this.remove(this.id(key, "cache"));
  }

  private id(key: string, cacheType?: CacheEntryType): string {
    return `${cacheType ?? "cache"}:${key}`;
  }

  private remove(id: string): void {
    const entry = this.entries.get(id);
    if (!entry) return;
    this.totalBytes -= entry.bytes;
    this.entries.delete(id);
  }
}

export default new MemoryIncrementalCache();
