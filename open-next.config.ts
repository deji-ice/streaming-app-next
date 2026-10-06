import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Persistent cache (OpenNext "small site" setup):
// - Workers KV incremental cache: stores unstable_cache data (TMDB DTOs, Wikidata facts)
//   and ISR pages across isolates and locations (binding NEXT_INC_CACHE_KV). KV is on the
//   free plan with no payment method. Limits to know: 1,000 writes/day and 100,000 reads/day,
//   and reads can lag a write by up to ~60 s between locations. Past the daily write limit a
//   failed cache write is logged and the page renders uncached; nothing breaks.
//   To move to R2 later (needs R2 enabled on the account, which asks for a card), swap in
//   "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache" and bind
//   NEXT_INC_CACHE_R2_BUCKET in wrangler.jsonc.
// - Durable Object queue: dedupes time-based revalidations (binding
//   NEXT_CACHE_DO_QUEUE); the default "dummy" queue throws on revalidation.
// - Cache interception: serves cached ISR pages without booting NextServer
//   (not compatible with PPR, which this app does not use).
// After attaching a custom domain, wrap the cache in a regional cache:
//   import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
//   incrementalCache: withRegionalCache(kvIncrementalCache, { mode: "long-lived" }),
export default defineCloudflareConfig({
  incrementalCache: kvIncrementalCache,
  queue: doQueue,
  enableCacheInterception: true,
});
