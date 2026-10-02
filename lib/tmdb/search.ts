import "server-only";
import { cached, TTL } from "./cached";
import { tmdbFetch } from "./client";
import { clampPage } from "./lists";
import { toCard, toCards, toPaged, toPersonCard, type RawListItem, type RawPaged } from "./normalize";
import type { CardDTO, Paged, PersonCardDTO } from "./types";

export type SearchResultDTO = CardDTO | PersonCardDTO;
export type SearchType = "multi" | "movie" | "tv" | "person";

/** Trim, collapse whitespace, lowercase (TMDB search is case-insensitive), cap at 100 chars. */
export function normalizeQuery(q: string | null | undefined): string {
  return (q ?? "").replace(/\s+/g, " ").trim().toLowerCase().slice(0, 100);
}

const validYear = (year: number | string | null | undefined): number | undefined => {
  const n = typeof year === "number" ? year : Number.parseInt(String(year ?? ""), 10);
  return Number.isInteger(n) && n >= 1870 && n <= 2100 ? n : undefined;
};

const searchLoader = cached(
  "search",
  TTL.search,
  () => ["search"],
  async (type: SearchType, query: string, year: number, page: number): Promise<Paged<SearchResultDTO>> => {
    const params: Record<string, string | number | undefined> = { query, page, include_adult: "false" };
    if (year > 0 && type === "movie") params.primary_release_year = year;
    if (year > 0 && type === "tv") params.first_air_date_year = year;
    const raw = await tmdbFetch<RawPaged<RawListItem>>(`/search/${type}`, params);
    let results: SearchResultDTO[];
    if (type === "person") {
      results = (raw.results ?? []).filter((r) => !r.adult).map(toPersonCard).filter((p): p is PersonCardDTO => p !== null);
    } else if (type === "multi") {
      results = (raw.results ?? []).flatMap((r): SearchResultDTO[] => {
        if (r.adult) return [];
        if (r.media_type === "person") {
          const p = toPersonCard(r);
          return p ? [p] : [];
        }
        const c = toCard(r, undefined, false);
        return c ? [c] : [];
      });
    } else {
      results = toCards(raw.results, type, false);
    }
    return toPaged(raw, results);
  },
);

/** /search/multi: movies, series and people mixed, TMDB relevance order. */
export function searchMulti(q: string, page: number = 1): Promise<Paged<SearchResultDTO>> {
  return searchLoader("multi", normalizeQuery(q), 0, clampPage(page));
}

/** /search/movie, optionally filtered by primary_release_year. */
export function searchMovies(q: string, opts: { year?: number | string | null; page?: number } = {}): Promise<Paged<CardDTO>> {
  return searchLoader("movie", normalizeQuery(q), validYear(opts.year) ?? 0, clampPage(opts.page ?? 1)) as Promise<Paged<CardDTO>>;
}

/** /search/tv, optionally filtered by first_air_date_year. */
export function searchTv(q: string, opts: { year?: number | string | null; page?: number } = {}): Promise<Paged<CardDTO>> {
  return searchLoader("tv", normalizeQuery(q), validYear(opts.year) ?? 0, clampPage(opts.page ?? 1)) as Promise<Paged<CardDTO>>;
}

/** /search/person (profile path, department and up to 3 known-for titles per row). */
export function searchPeople(q: string, page: number = 1): Promise<Paged<PersonCardDTO>> {
  return searchLoader("person", normalizeQuery(q), 0, clampPage(page)) as Promise<Paged<PersonCardDTO>>;
}

/**
 * One search entry point. `type` "movie" | "tv" | "person" use the typed
 * endpoints (year filters apply to movie and tv); anything else uses multi.
 */
export function search(
  q: string,
  opts: { type?: string | null; year?: number | string | null; page?: number } = {},
): Promise<Paged<SearchResultDTO>> {
  const type = opts.type === "series" ? "tv" : opts.type;
  if (type === "movie") return searchMovies(q, opts);
  if (type === "tv") return searchTv(q, opts);
  if (type === "person" || type === "people") return searchPeople(q, opts.page);
  return searchMulti(q, opts.page);
}
