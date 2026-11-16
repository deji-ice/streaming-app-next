import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

import memoryIncrementalCache from "./lib/cloudflare/memory-incremental-cache";

// Cache setup, and why it is not Workers KV or R2:
// - Incremental cache: memory of one Worker isolate (lib/cloudflare/memory-incremental-cache.ts).
//   It holds unstable_cache data (TMDB DTOs, Wikidata facts) and ISR pages for their
//   revalidate time, capped at 24 MB, and it costs nothing. Workers KV bills per read, per
//   write and per GB stored, and on a paid account it has no daily cap: crawlers hitting
//   thousands of unique /person and /movie pages produced 24.9M writes, 96M reads and
//   303 GB of entries that never expired in 10 days (about $400). Do not put a
//   per-operation store behind public, crawlable pages again.
// - Durable Object queue: dedupes time-based revalidations (binding NEXT_CACHE_DO_QUEUE).
//   The memory cache never returns stale entries, so revalidation is not normally queued.
// - Cache interception: serves cached ISR pages without booting NextServer
//   (not compatible with PPR, which this app does not use).
//
// A shared cache across isolates is worth having again only behind a custom domain, using
// the Cache API (free, no per-operation fee; it does nothing on *.workers.dev):
//   import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
//   incrementalCache: withRegionalCache(memoryIncrementalCache, { mode: "short-lived" }),
export default defineCloudflareConfig({
  incrementalCache: memoryIncrementalCache,
  queue: doQueue,
  enableCacheInterception: true,
});
