import "server-only";
import { cache } from "react";
import { unstable_cache } from "next/cache";

/**
 * Two-layer cache for loaders:
 * 1. React cache(): one promise per argument list per request, so
 *    generateMetadata and the page share a single call.
 * 2. unstable_cache: the returned DTO is stored in the Next incremental cache
 *    (Workers KV on Cloudflare via open-next.config.ts) for `revalidate` seconds and
 *    tagged "tmdb", the loader name and `tags(...args)`.
 *
 * Thrown errors are never cached, and a failed background revalidation keeps
 * the previous entry. Nothing here holds request state at module scope: the
 * React cache is scoped to the current request by React itself.
 *
 * Arguments must be strings or numbers (they become cache key parts), and the
 * result must be JSON-serializable.
 */

/**
 * Part of every cache key. unstable_cache keys on the name and arguments, not on
 * the loader's code, so entries stored by an older version of a loader would keep
 * being served after a deploy. Bump this whenever a loader's output changes shape
 * or meaning; every entry is then fetched fresh once.
 *   2: lists no longer contain titles that are not released yet.
 */
const CACHE_VERSION = "2";

export function cached<A extends (string | number)[], R>(
  name: string,
  revalidate: number,
  tags: (...args: NoInfer<A>) => string[],
  fn: (...args: A) => Promise<R>,
): (...args: A) => Promise<R> {
  return cache((...args: A) =>
    unstable_cache(() => fn(...args), [`v${CACHE_VERSION}`, name, ...args.map(String)], {
      revalidate,
      tags: ["tmdb", name, ...tags(...args)],
    })(),
  );
}

/** Cache lifetimes in seconds (audit_data-layer 7.4/7.5). Never longer than TMDB's 6-month cap. */
export const TTL = {
  config: 604800, // genres, regions, provider lists: 7 days
  trending: 1800, // 30 min
  list: 3600, // 1 h
  listTopRated: 86400, // 24 h
  listAiring: 1800, // airing_today, on_the_air, new episodes: 30 min
  discover: 3600,
  movie: 43200, // 12 h
  tv: 21600, // 6 h
  season: 21600,
  seasonEnded: 604800, // shows marked Ended or Canceled
  person: 604800,
  collection: 604800,
  entity: 604800, // company, network
  search: 3600,
  facts: 604800, // Wikidata, 7 days
} as const;
