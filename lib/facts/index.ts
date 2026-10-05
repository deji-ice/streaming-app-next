import "server-only";
import type { Fact, MediaType } from "@/lib/tmdb/types";
import { buildFacts, type FactsTmdbInput, type WdRow } from "./build";
import { getWikidataRows, isQid } from "./wikidata";

export type { FactsTmdbInput } from "./build";
export { MAX_FACTS } from "./build";

/**
 * Fun facts for a title (at most 8), from Wikidata (CC0, cached 7 days,
 * 2.5 s timeout) plus facts derived from the TMDB details already loaded
 * (box office vs budget, collection, credits scenes, seasons and episodes).
 *
 * Never throws. When Wikidata fails or the title has no wikidata_id, only the
 * TMDB-derived facts are returned; on any other error it returns []. Render
 * it inside <Suspense> so a slow Wikidata response never blocks the page.
 *
 * @example
 * const movie = await getMovie(id);
 * const facts = await getFacts({ type: "movie", wikidataId: movie.externalIds.wikidataId, tmdb: movie });
 */
export async function getFacts({
  type,
  wikidataId,
  tmdb,
}: {
  type: MediaType;
  wikidataId: string | null | undefined;
  /** MovieDTO or TvDTO (or any object with the same fields) */
  tmdb: FactsTmdbInput;
}): Promise<Fact[]> {
  try {
    const qid = isQid(wikidataId) ? wikidataId : null;
    let rows: WdRow[] = [];
    if (qid) {
      try {
        rows = await getWikidataRows(qid);
      } catch (error) {
        console.warn(`[facts] Wikidata unavailable for ${qid}:`, error instanceof Error ? error.message : error);
      }
    }
    return buildFacts({ type, qid, rows, tmdb });
  } catch (error) {
    console.error("[facts] failed:", error);
    return [];
  }
}
