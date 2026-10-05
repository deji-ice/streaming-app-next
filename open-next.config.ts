import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";
import doQueue from "@opennextjs/cloudflare/overrides/queue/do-queue";

// Phase 1 persistent cache (audit_data-layer section 9, OpenNext "small site" setup):
// - R2 incremental cache: stores unstable_cache data (TMDB DTOs, Wikidata facts)
//   and ISR pages across isolates and locations (binding NEXT_INC_CACHE_R2_BUCKET).
// - Durable Object queue: dedupes time-based revalidations (binding
//   NEXT_CACHE_DO_QUEUE); the default "dummy" queue throws on revalidation.
// - Cache interception: serves cached ISR pages without booting NextServer
//   (not compatible with PPR, which this app does not use).
// After attaching a custom domain, wrap the R2 cache in a regional cache:
//   import { withRegionalCache } from "@opennextjs/cloudflare/overrides/incremental-cache/regional-cache";
//   incrementalCache: withRegionalCache(r2IncrementalCache, { mode: "long-lived" }),
export default defineCloudflareConfig({
  incrementalCache: r2IncrementalCache,
  queue: doQueue,
  enableCacheInterception: true,
});
