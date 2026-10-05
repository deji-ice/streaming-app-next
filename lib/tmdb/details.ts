import "server-only";
import { cache } from "react";
import { cached, TTL } from "./cached";
import { assertTmdbId, tmdbFetch } from "./client";
import { isoDay } from "./lists";
import {
  toCollection,
  toMovie,
  toPersonBase,
  toSeason,
  toTv,
  type PersonBaseDTO,
  type RawCollection,
  type RawMovie,
  type RawPerson,
  type RawSeason,
  type RawTv,
} from "./normalize";
import { selectWatchProviders } from "./providers";
import type {
  CollectionDTO,
  MediaType,
  MovieDTO,
  PersonCreditDTO,
  PersonCreditGroupDTO,
  PersonDTO,
  SeasonDTO,
  TvDTO,
  WatchProvidersDTO,
} from "./types";

/* ------------------------------------------------------------------------ */
/* Movie                                                                     */
/* ------------------------------------------------------------------------ */

/** 9 appends in one call (TMDB allows 20). Images and videos limited to English + textless. */
const MOVIE_APPEND = "credits,videos,images,recommendations,similar,release_dates,external_ids,keywords,watch/providers";

const movieLoader = cached(
  "movie",
  TTL.movie,
  (id: number) => [`movie:${id}`],
  async (id: number): Promise<MovieDTO> => {
    const raw = await tmdbFetch<RawMovie>(`/movie/${id}`, {
      append_to_response: MOVIE_APPEND,
      include_image_language: "en,null",
      include_video_language: "en,null",
    });
    return toMovie(raw);
  },
);

/**
 * One TMDB call per movie (details + credits, videos, images incl. logos,
 * recommendations with similar as fallback, US certification, external ids,
 * keywords, watch providers for every region).
 * Throws TmdbError; use isTmdbNotFound(error) to decide notFound().
 */
export function getMovie(id: number | string): Promise<MovieDTO> {
  return movieLoader(assertTmdbId(id));
}

/* ------------------------------------------------------------------------ */
/* TV                                                                        */
/* ------------------------------------------------------------------------ */

/** 10 appends: aggregate_credits for the whole run, credits as fallback. */
const TV_APPEND =
  "aggregate_credits,credits,videos,images,recommendations,similar,content_ratings,external_ids,keywords,watch/providers";

const tvLoader = cached(
  "tv",
  TTL.tv,
  (id: number) => [`tv:${id}`],
  async (id: number): Promise<TvDTO> => {
    const raw = await tmdbFetch<RawTv>(`/tv/${id}`, {
      append_to_response: TV_APPEND,
      include_image_language: "en,null",
      include_video_language: "en,null",
    });
    return toTv(raw);
  },
);

/** One TMDB call per series (no episodes; load them with getSeason in parallel). */
export function getTv(id: number | string): Promise<TvDTO> {
  return tvLoader(assertTmdbId(id));
}

const seasonFetcher = async (tvId: number, n: number): Promise<SeasonDTO> =>
  toSeason(await tmdbFetch<RawSeason>(`/tv/${tvId}/season/${n}`), tvId);

const seasonLoader = cached("season", TTL.season, (tvId: number, n: number) => [`tv:${tvId}`, `tv:${tvId}:s${n}`], seasonFetcher);
const endedSeasonLoader = cached(
  "season:ended",
  TTL.seasonEnded,
  (tvId: number, n: number) => [`tv:${tvId}`, `tv:${tvId}:s${n}`],
  seasonFetcher,
);

/**
 * Episodes of one season (crew and guest stars dropped). Pass `ended: true`
 * (from TvDTO.ended) to cache a finished show's season for 7 days instead of 6 h.
 * Call it in parallel with getTv: Promise.all([getTv(id), getSeason(id, n)]).
 */
export function getSeason(tvId: number | string, seasonNumber: number | string, opts: { ended?: boolean } = {}): Promise<SeasonDTO> {
  const id = assertTmdbId(tvId);
  const n = typeof seasonNumber === "number" ? seasonNumber : Number.parseInt(seasonNumber, 10);
  const season = Number.isSafeInteger(n) && n >= 0 ? n : 1;
  return (opts.ended ? endedSeasonLoader : seasonLoader)(id, season);
}

/* ------------------------------------------------------------------------ */
/* Watch providers for one title in one region                               */
/* ------------------------------------------------------------------------ */

/** Reads the cached details (no extra TMDB call) and returns one region's providers, or null. */
export async function getWatchProviders(type: MediaType, id: number | string, region: string): Promise<WatchProvidersDTO | null> {
  const details = type === "movie" ? await getMovie(id) : await getTv(id);
  return selectWatchProviders(details.watchProviders, region);
}

/* ------------------------------------------------------------------------ */
/* Person                                                                    */
/* ------------------------------------------------------------------------ */

const personLoader = cached(
  "person",
  TTL.person,
  (id: number) => [`person:${id}`],
  async (id: number): Promise<PersonBaseDTO> => {
    const raw = await tmdbFetch<RawPerson>(`/person/${id}`, {
      append_to_response: "combined_credits,images,external_ids",
    });
    return toPersonBase(raw);
  },
);

const RAIL_CAP = 20;
/** Credits weighted below this are self appearances or talk/news shows. */
const SELF_WEIGHT = 0.06;

const keyOf = (c: PersonCreditDTO) => `${c.department}|${c.mediaType}:${c.id}`;
const titleKey = (c: PersonCreditDTO) => `${c.mediaType}:${c.id}`;

function dedupeTitles(list: PersonCreditDTO[], cap: number): PersonCreditDTO[] {
  const seen = new Set<string>();
  const out: PersonCreditDTO[] = [];
  for (const c of list) {
    const k = titleKey(c);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
    if (out.length >= cap) break;
  }
  return out;
}

/** Newest first; undated (announced) credits first. */
const byDateDesc = (a: PersonCreditDTO, b: PersonCreditDTO) => {
  if (!a.releaseDate && !b.releaseDate) return (b.popularity ?? 0) - (a.popularity ?? 0);
  if (!a.releaseDate) return -1;
  if (!b.releaseDate) return 1;
  return b.releaseDate.localeCompare(a.releaseDate);
};

/** Derive the date-dependent rails from the cached base (cheap, runs per request). */
function derivePerson(base: PersonBaseDTO, today: string): PersonDTO {
  const { weights, credits: all, ...rest } = base;
  const weight = (c: PersonCreditDTO) => weights[keyOf(c)] ?? 0.5;
  const dept = base.knownForDepartment;
  // Prefer the person's main department when the same title appears in several.
  const preferred = [...all].sort((a, b) => Number(b.department === dept) - Number(a.department === dept));
  const railable = preferred.filter((c) => weight(c) >= SELF_WEIGHT);

  const upcoming = dedupeTitles(
    [
      ...railable.filter((c) => c.releaseDate && c.releaseDate > today).sort((a, b) => a.releaseDate!.localeCompare(b.releaseDate!)),
      ...railable.filter((c) => !c.releaseDate).sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)),
    ],
    RAIL_CAP,
  );

  const latest = dedupeTitles(
    railable.filter((c) => c.releaseDate && c.releaseDate <= today).sort((a, b) => b.releaseDate!.localeCompare(a.releaseDate!)),
    RAIL_CAP,
  );

  const score = (c: PersonCreditDTO) =>
    (c.voteCount ?? 0) * (0.5 + Math.min(c.popularity ?? 0, 100) / 200) * weight(c) * (c.department === dept ? 1.5 : 1);
  const knownFor = dedupeTitles(
    railable.filter((c) => c.releaseDate && c.releaseDate <= today && (c.voteCount ?? 0) > 0).sort((a, b) => score(b) - score(a)),
    12,
  );

  const groups = new Map<string, PersonCreditDTO[]>();
  for (const c of all) {
    const list = groups.get(c.department) ?? [];
    list.push(c);
    groups.set(c.department, list);
  }
  const credits: PersonCreditGroupDTO[] = [...groups.entries()]
    .sort(([a, la], [b, lb]) => Number(b === "Acting") - Number(a === "Acting") || lb.length - la.length)
    .map(([department, list]) => ({ department, credits: [...list].sort(byDateDesc) }));

  return { ...rest, knownFor, latest, upcoming, credits };
}

const personForDay = cache(async (id: number, today: string): Promise<PersonDTO> => derivePerson(await personLoader(id), today));

/**
 * Person details + combined credits + images + external ids (one TMDB call,
 * cached 7 days). knownFor / latest / upcoming are derived per request from
 * today's date, so they never go stale while the base is cached.
 */
export function getPerson(id: number | string): Promise<PersonDTO> {
  return personForDay(assertTmdbId(id), isoDay(0));
}

/* ------------------------------------------------------------------------ */
/* Collection                                                                */
/* ------------------------------------------------------------------------ */

const collectionLoader = cached(
  "collection",
  TTL.collection,
  (id: number) => [`collection:${id}`],
  async (id: number): Promise<CollectionDTO> => toCollection(await tmdbFetch<RawCollection>(`/collection/${id}`)),
);

/** A movie collection (e.g. MovieDTO.collection.id). Load lazily, only when shown. */
export function getCollection(id: number | string): Promise<CollectionDTO> {
  return collectionLoader(assertTmdbId(id));
}
