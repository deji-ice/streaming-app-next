import "server-only";
import type {
  CardDTO,
  CastMemberDTO,
  CollectionDTO,
  CollectionRefDTO,
  CompanyDTO,
  CountryDTO,
  CrewMemberDTO,
  EpisodeDTO,
  EpisodeRefDTO,
  ExternalIdsDTO,
  GenreDTO,
  ImageDTO,
  KeywordDTO,
  LanguageDTO,
  MediaType,
  MovieDTO,
  NetworkDTO,
  Paged,
  PersonCardDTO,
  PersonCreditDTO,
  PersonRefDTO,
  SeasonDTO,
  SeasonSummaryDTO,
  TvDTO,
  VideoDTO,
  WatchProvidersIndex,
} from "./types";

/* ------------------------------------------------------------------------ */
/* Raw TMDB shapes (only the fields we read)                                 */
/* ------------------------------------------------------------------------ */

export interface RawPaged<T> {
  page?: number;
  total_pages?: number;
  total_results?: number;
  results?: T[];
}

export interface RawListItem {
  id: number;
  media_type?: string;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  genre_ids?: number[];
  overview?: string;
  adult?: boolean;
  known_for_department?: string | null;
  known_for?: RawListItem[];
}

interface RawGenre { id: number; name: string }
interface RawCompany { id: number; name: string; logo_path?: string | null; origin_country?: string | null }
interface RawCountry { iso_3166_1: string; name: string }
interface RawLanguage { iso_639_1: string; english_name?: string; name?: string }
interface RawImage { file_path: string; width: number; height: number; iso_639_1?: string | null; vote_average?: number; vote_count?: number }
interface RawImages { logos?: RawImage[]; backdrops?: RawImage[]; posters?: RawImage[]; profiles?: RawImage[] }
interface RawVideo { key: string; name: string; site: string; type: string; official?: boolean; published_at?: string | null; iso_639_1?: string | null }
interface RawCast { id: number; name: string; profile_path?: string | null; character?: string | null; order?: number }
interface RawCrew { id: number; name: string; profile_path?: string | null; job: string; department: string }
interface RawAggCast { id: number; name: string; profile_path?: string | null; order?: number; total_episode_count?: number; roles?: { character?: string | null; episode_count?: number }[] }
interface RawAggCrew { id: number; name: string; profile_path?: string | null; department: string; total_episode_count?: number; jobs?: { job: string; episode_count?: number }[] }
interface RawProvider { provider_id: number; provider_name: string; logo_path?: string | null; display_priority?: number }
interface RawProviderRegion { link?: string | null; flatrate?: RawProvider[]; free?: RawProvider[]; ads?: RawProvider[]; rent?: RawProvider[]; buy?: RawProvider[] }
interface RawExternalIds { imdb_id?: string | null; wikidata_id?: string | null; facebook_id?: string | null; instagram_id?: string | null; twitter_id?: string | null; tiktok_id?: string | null; youtube_id?: string | null }
interface RawEpisode { id: number; season_number: number; episode_number: number; name?: string; overview?: string; still_path?: string | null; air_date?: string | null; runtime?: number | null; vote_average?: number; vote_count?: number }
interface RawSeasonSummary { id: number; season_number: number; name?: string; episode_count?: number; air_date?: string | null; poster_path?: string | null; overview?: string; vote_average?: number }

interface RawDetailBase {
  id: number;
  overview?: string;
  tagline?: string | null;
  poster_path?: string | null;
  backdrop_path?: string | null;
  vote_average?: number;
  vote_count?: number;
  popularity?: number;
  status?: string | null;
  homepage?: string | null;
  original_language?: string | null;
  genres?: RawGenre[];
  production_companies?: RawCompany[];
  production_countries?: RawCountry[];
  spoken_languages?: RawLanguage[];
  videos?: { results?: RawVideo[] };
  images?: RawImages;
  recommendations?: RawPaged<RawListItem>;
  similar?: RawPaged<RawListItem>;
  external_ids?: RawExternalIds;
  "watch/providers"?: { results?: Record<string, RawProviderRegion> };
}

export interface RawMovie extends RawDetailBase {
  title: string;
  original_title?: string;
  release_date?: string | null;
  runtime?: number | null;
  budget?: number;
  revenue?: number;
  imdb_id?: string | null;
  belongs_to_collection?: { id: number; name: string; poster_path?: string | null; backdrop_path?: string | null } | null;
  credits?: { cast?: RawCast[]; crew?: RawCrew[] };
  release_dates?: { results?: { iso_3166_1: string; release_dates?: { certification?: string; type?: number }[] }[] };
  keywords?: { keywords?: KeywordDTO[] };
}

export interface RawTv extends RawDetailBase {
  name: string;
  original_name?: string;
  first_air_date?: string | null;
  last_air_date?: string | null;
  type?: string | null;
  in_production?: boolean;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  seasons?: RawSeasonSummary[];
  last_episode_to_air?: RawEpisode | null;
  next_episode_to_air?: RawEpisode | null;
  networks?: RawCompany[];
  created_by?: { id: number; name: string; profile_path?: string | null }[];
  origin_country?: string[];
  credits?: { cast?: RawCast[]; crew?: RawCrew[] };
  aggregate_credits?: { cast?: RawAggCast[]; crew?: RawAggCrew[] };
  content_ratings?: { results?: { iso_3166_1: string; rating?: string }[] };
  keywords?: { results?: KeywordDTO[] };
}

export interface RawSeason {
  id: number;
  season_number: number;
  name?: string;
  overview?: string;
  air_date?: string | null;
  poster_path?: string | null;
  episodes?: RawEpisode[];
}

export interface RawPersonCredit extends RawListItem {
  character?: string | null;
  job?: string;
  department?: string;
  order?: number;
  episode_count?: number;
}

export interface RawPerson {
  id: number;
  name: string;
  biography?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  known_for_department?: string | null;
  profile_path?: string | null;
  homepage?: string | null;
  popularity?: number;
  also_known_as?: string[];
  imdb_id?: string | null;
  combined_credits?: { cast?: RawPersonCredit[]; crew?: RawPersonCredit[] };
  images?: { profiles?: RawImage[] };
  external_ids?: RawExternalIds;
}

export interface RawCollection {
  id: number;
  name: string;
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  parts?: RawListItem[];
}

/* ------------------------------------------------------------------------ */
/* Small helpers                                                             */
/* ------------------------------------------------------------------------ */

const str = (value: string | null | undefined): string | null => {
  const s = typeof value === "string" ? value.trim() : "";
  return s === "" ? null : s;
};

/** YYYY-MM-DD or null (TMDB uses "" for unknown dates). */
export const dateOrNull = (value: string | null | undefined): string | null =>
  typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : null;

export const yearOf = (value: string | null | undefined): number | null => {
  const d = dateOrNull(value);
  return d ? Number(d.slice(0, 4)) : null;
};

/** vote_average to 1 decimal, null when there are no votes. */
export const ratingOf = (average: number | undefined, count: number | undefined): number | null =>
  typeof average === "number" && average > 0 && (count === undefined || count > 0)
    ? Math.round(average * 10) / 10
    : null;

const positiveOrNull = (n: number | null | undefined): number | null =>
  typeof n === "number" && Number.isFinite(n) && n > 0 ? n : null;

const round2 = (n: number | undefined): number => (typeof n === "number" ? Math.round(n * 100) / 100 : 0);

/* ------------------------------------------------------------------------ */
/* Cards and pages                                                           */
/* ------------------------------------------------------------------------ */

/** A list item as a CardDTO. Returns null for people and unknown types. */
export function toCard(raw: RawListItem, fallbackType?: MediaType, withOverview = true): CardDTO | null {
  const type: MediaType | null =
    raw.media_type === "movie" || raw.media_type === "tv"
      ? raw.media_type
      : raw.media_type
        ? null
        : (fallbackType ?? null);
  if (!type || typeof raw.id !== "number") return null;
  const title = str(type === "movie" ? (raw.title ?? raw.name) : (raw.name ?? raw.title));
  if (!title) return null;
  const date = dateOrNull(type === "movie" ? raw.release_date : raw.first_air_date);
  const card: CardDTO = {
    id: raw.id,
    mediaType: type,
    title,
    posterPath: str(raw.poster_path),
    backdropPath: str(raw.backdrop_path),
    year: yearOf(date),
    rating: ratingOf(raw.vote_average, raw.vote_count),
    genreIds: Array.isArray(raw.genre_ids) ? raw.genre_ids : [],
    releaseDate: date,
    popularity: round2(raw.popularity),
    voteCount: raw.vote_count ?? 0,
  };
  if (withOverview && raw.overview) card.overview = raw.overview;
  return card;
}

export function toCards(items: RawListItem[] | undefined, fallbackType?: MediaType, withOverview = true): CardDTO[] {
  const out: CardDTO[] = [];
  const seen = new Set<string>();
  for (const item of items ?? []) {
    if (item.adult) continue;
    const card = toCard(item, fallbackType, withOverview);
    if (!card) continue;
    const key = `${card.mediaType}:${card.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(card);
  }
  return out;
}

export function toPersonCard(raw: RawListItem): PersonCardDTO | null {
  const name = str(raw.name);
  if (!name || typeof raw.id !== "number") return null;
  return {
    id: raw.id,
    mediaType: "person",
    title: name,
    name,
    profilePath: str(raw.profile_path),
    knownForDepartment: str(raw.known_for_department),
    knownFor: (raw.known_for ?? [])
      .map((k) => str(k.title ?? k.name))
      .filter((t): t is string => t !== null)
      .slice(0, 3),
    popularity: round2(raw.popularity),
  };
}

/** TMDB caps list pages at 500. */
export function toPaged<T>(raw: RawPaged<unknown>, results: T[]): Paged<T> {
  return {
    page: raw.page ?? 1,
    totalPages: Math.min(raw.total_pages ?? 0, 500),
    totalResults: raw.total_results ?? 0,
    results,
  };
}

export const toGenres = (genres: RawGenre[] | undefined): GenreDTO[] =>
  (genres ?? []).map((g) => ({ id: g.id, name: g.name }));

export const toCompany = (c: RawCompany): CompanyDTO => ({
  id: c.id,
  name: c.name,
  logoPath: str(c.logo_path),
  originCountry: str(c.origin_country),
});

export const toNetwork = (n: RawCompany): NetworkDTO => ({
  id: n.id,
  name: n.name,
  logoPath: str(n.logo_path),
  originCountry: str(n.origin_country),
});

const toCountries = (list: RawCountry[] | undefined): CountryDTO[] =>
  (list ?? []).map((c) => ({ code: c.iso_3166_1, name: c.name }));

const toLanguages = (list: RawLanguage[] | undefined): LanguageDTO[] =>
  (list ?? []).map((l) => ({ code: l.iso_639_1, name: l.english_name || l.name || l.iso_639_1 }));

export const toExternalIds = (raw: RawExternalIds | undefined, imdbFallback?: string | null): ExternalIdsDTO => ({
  imdbId: str(raw?.imdb_id) ?? str(imdbFallback),
  wikidataId: str(raw?.wikidata_id),
  facebookId: str(raw?.facebook_id),
  instagramId: str(raw?.instagram_id),
  twitterId: str(raw?.twitter_id),
  tiktokId: str(raw?.tiktok_id),
  youtubeId: str(raw?.youtube_id),
});

/* ------------------------------------------------------------------------ */
/* Media: images, videos                                                     */
/* ------------------------------------------------------------------------ */

const byVotes = (a: RawImage, b: RawImage) =>
  (b.vote_average ?? 0) - (a.vote_average ?? 0) || (b.vote_count ?? 0) - (a.vote_count ?? 0) || b.width - a.width;

/** Best English title logo, else the best textless one. */
export function pickLogo(images: RawImages | undefined): ImageDTO | null {
  const logos = images?.logos ?? [];
  const best = [...logos.filter((l) => l.iso_639_1 === "en")].sort(byVotes)[0] ?? [...logos.filter((l) => !l.iso_639_1)].sort(byVotes)[0];
  return best ? { path: best.file_path, width: best.width, height: best.height, lang: best.iso_639_1 ?? null } : null;
}

/** Up to 8 backdrops, textless first, then English; the main backdrop first when present. */
export function pickBackdrops(images: RawImages | undefined, main: string | null): string[] {
  const all = images?.backdrops ?? [];
  const ordered = [...all.filter((b) => !b.iso_639_1).sort(byVotes), ...all.filter((b) => b.iso_639_1 === "en").sort(byVotes)];
  const paths = [main, ...ordered.map((b) => b.file_path)].filter((p): p is string => !!p);
  return [...new Set(paths)].slice(0, 8);
}

const VIDEO_TYPE_ORDER = ["Trailer", "Teaser", "Clip", "Featurette", "Behind the Scenes", "Bloopers", "Opening Credits"];
const videoRank = (type: string) => {
  const i = VIDEO_TYPE_ORDER.indexOf(type);
  return i === -1 ? VIDEO_TYPE_ORDER.length : i;
};

/** YouTube videos, trailers first then teasers, clips, featurettes; official first; newest first. Up to 20. */
export function toVideos(raw: RawVideo[] | undefined): VideoDTO[] {
  const seen = new Set<string>();
  return (raw ?? [])
    .filter((v) => v.site === "YouTube" && typeof v.key === "string" && v.key !== "")
    .filter((v) => (seen.has(v.key) ? false : (seen.add(v.key), true)))
    .sort(
      (a, b) =>
        videoRank(a.type) - videoRank(b.type) ||
        Number(!!b.official) - Number(!!a.official) ||
        Number(b.iso_639_1 === "en") - Number(a.iso_639_1 === "en") ||
        (b.published_at ?? "").localeCompare(a.published_at ?? ""),
    )
    .slice(0, 20)
    .map((v) => ({ key: v.key, name: v.name, type: v.type, official: !!v.official, publishedAt: v.published_at ?? null }));
}

/** First official English trailer; else any trailer; else a teaser. */
export function pickTrailer(raw: RawVideo[] | undefined): VideoDTO | null {
  const yt = (raw ?? []).filter((v) => v.site === "YouTube" && v.key);
  const pick =
    yt
      .filter((v) => v.type === "Trailer" && v.official && (v.iso_639_1 ?? "en") === "en")
      .sort((a, b) => (a.published_at ?? "").localeCompare(b.published_at ?? ""))[0] ??
    yt.find((v) => v.type === "Trailer") ??
    yt.find((v) => v.type === "Teaser");
  return pick ? { key: pick.key, name: pick.name, type: pick.type, official: !!pick.official, publishedAt: pick.published_at ?? null } : null;
}

/* ------------------------------------------------------------------------ */
/* People in credits                                                         */
/* ------------------------------------------------------------------------ */

const CAST_CAP = 150;
const CREW_CAP = 300;

export function toCast(raw: RawCast[] | undefined): CastMemberDTO[] {
  return [...(raw ?? [])]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, CAST_CAP)
    .map((c, i) => ({ id: c.id, name: c.name, profilePath: str(c.profile_path), character: str(c.character), order: c.order ?? i }));
}

export function toCrew(raw: RawCrew[] | undefined): CrewMemberDTO[] {
  const seen = new Set<string>();
  const out: CrewMemberDTO[] = [];
  for (const c of raw ?? []) {
    const key = `${c.id}|${c.job}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ id: c.id, name: c.name, profilePath: str(c.profile_path), job: c.job, department: c.department });
    if (out.length >= CREW_CAP) break;
  }
  return out;
}

export function toAggregateCast(raw: RawAggCast[] | undefined): CastMemberDTO[] {
  return [...(raw ?? [])]
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))
    .slice(0, CAST_CAP)
    .map((c, i) => {
      const roles = [...(c.roles ?? [])].sort((a, b) => (b.episode_count ?? 0) - (a.episode_count ?? 0));
      const characters = [...new Set(roles.map((r) => str(r.character)).filter((x): x is string => x !== null))];
      return {
        id: c.id,
        name: c.name,
        profilePath: str(c.profile_path),
        character: characters.length ? characters.slice(0, 2).join(" / ") : null,
        order: c.order ?? i,
        episodeCount: c.total_episode_count ?? 0,
      };
    });
}

export function toAggregateCrew(raw: RawAggCrew[] | undefined): CrewMemberDTO[] {
  const out: CrewMemberDTO[] = [];
  const sorted = [...(raw ?? [])].sort((a, b) => (b.total_episode_count ?? 0) - (a.total_episode_count ?? 0));
  for (const c of sorted) {
    const jobs = [...(c.jobs ?? [])].sort((a, b) => (b.episode_count ?? 0) - (a.episode_count ?? 0));
    const job = jobs.map((j) => j.job).filter(Boolean).slice(0, 2).join(", ");
    if (!job) continue;
    out.push({ id: c.id, name: c.name, profilePath: str(c.profile_path), job, department: c.department, episodeCount: c.total_episode_count ?? 0 });
    if (out.length >= CREW_CAP) break;
  }
  return out;
}

const WRITER_JOBS = ["Screenplay", "Writer", "Story", "Novel", "Characters", "Author", "Original Story", "Comic Book", "Book"];

/** People with one of `jobs`, merged per person, in first-seen order. */
function peopleWithJobs(crew: RawCrew[] | undefined, jobs: string[], cap: number): PersonRefDTO[] {
  const byId = new Map<number, PersonRefDTO & { jobs: string[] }>();
  for (const c of crew ?? []) {
    if (!jobs.includes(c.job)) continue;
    const existing = byId.get(c.id);
    if (existing) {
      if (!existing.jobs.includes(c.job)) existing.jobs.push(c.job);
    } else {
      byId.set(c.id, { id: c.id, name: c.name, profilePath: str(c.profile_path), jobs: [c.job] });
    }
  }
  return [...byId.values()].slice(0, cap).map(({ jobs: j, ...p }) => ({ ...p, job: j.join(", ") }));
}

/* ------------------------------------------------------------------------ */
/* Watch providers                                                           */
/* ------------------------------------------------------------------------ */

export function toWatchProvidersIndex(raw: Record<string, RawProviderRegion> | undefined): WatchProvidersIndex {
  const index: WatchProvidersIndex = { providers: {}, regions: {} };
  const ids = (list: RawProvider[] | undefined): number[] => {
    const sorted = [...(list ?? [])].sort((a, b) => (a.display_priority ?? 999) - (b.display_priority ?? 999));
    return sorted.map((p) => {
      index.providers[String(p.provider_id)] ??= { name: p.provider_name, logoPath: str(p.logo_path) };
      return p.provider_id;
    });
  };
  for (const [region, entry] of Object.entries(raw ?? {})) {
    index.regions[region] = {
      link: str(entry.link),
      flatrate: ids(entry.flatrate),
      free: ids(entry.free),
      ads: ids(entry.ads),
      rent: ids(entry.rent),
      buy: ids(entry.buy),
    };
  }
  return index;
}

/* ------------------------------------------------------------------------ */
/* Movie / TV / season                                                       */
/* ------------------------------------------------------------------------ */

/** US certification: theatrical (3) first, then limited (2), digital (4), physical (5), TV (6), premiere (1). */
function usCertification(raw: RawMovie["release_dates"]): string | null {
  const us = raw?.results?.find((r) => r.iso_3166_1 === "US");
  const order = [3, 2, 4, 5, 6, 1];
  const dates = [...(us?.release_dates ?? [])].sort((a, b) => order.indexOf(a.type ?? 0) - order.indexOf(b.type ?? 0));
  return str(dates.find((d) => str(d.certification))?.certification);
}

function recommendationsOf(raw: RawDetailBase, type: MediaType): CardDTO[] {
  const recs = toCards(raw.recommendations?.results, type, false);
  const list = recs.length ? recs : toCards(raw.similar?.results, type, false);
  return list.filter((c) => !(c.id === raw.id && c.mediaType === type)).slice(0, 20);
}

function detailBase(raw: RawDetailBase, type: MediaType, title: string, originalTitle: string | undefined, date: string | null, imdbFallback?: string | null) {
  const posterPath = str(raw.poster_path);
  const backdropPath = str(raw.backdrop_path);
  return {
    id: raw.id,
    title,
    originalTitle: str(originalTitle) ?? title,
    originalLanguage: str(raw.original_language),
    tagline: str(raw.tagline),
    overview: raw.overview ?? "",
    posterPath,
    backdropPath,
    logo: pickLogo(raw.images),
    backdrops: pickBackdrops(raw.images, backdropPath),
    year: yearOf(date),
    rating: ratingOf(raw.vote_average, raw.vote_count),
    voteCount: raw.vote_count ?? 0,
    popularity: round2(raw.popularity),
    status: str(raw.status),
    homepage: str(raw.homepage),
    genres: toGenres(raw.genres),
    productionCompanies: (raw.production_companies ?? []).map(toCompany),
    productionCountries: toCountries(raw.production_countries),
    spokenLanguages: toLanguages(raw.spoken_languages),
    videos: toVideos(raw.videos?.results),
    trailer: pickTrailer(raw.videos?.results),
    recommendations: recommendationsOf(raw, type),
    watchProviders: toWatchProvidersIndex(raw["watch/providers"]?.results),
    externalIds: toExternalIds(raw.external_ids, imdbFallback),
  };
}

export function toMovie(raw: RawMovie): MovieDTO {
  const releaseDate = dateOrNull(raw.release_date);
  const collection = raw.belongs_to_collection;
  return {
    ...detailBase(raw, "movie", raw.title, raw.original_title, releaseDate, raw.imdb_id),
    mediaType: "movie",
    releaseDate,
    runtime: positiveOrNull(raw.runtime),
    certification: usCertification(raw.release_dates),
    budget: positiveOrNull(raw.budget),
    revenue: positiveOrNull(raw.revenue),
    collection: collection
      ? { id: collection.id, name: collection.name, posterPath: str(collection.poster_path), backdropPath: str(collection.backdrop_path) }
      : null,
    cast: toCast(raw.credits?.cast),
    crew: toCrew(raw.credits?.crew),
    directors: peopleWithJobs(raw.credits?.crew, ["Director"], 4),
    writers: peopleWithJobs(raw.credits?.crew, WRITER_JOBS, 6),
    keywords: (raw.keywords?.keywords ?? []).slice(0, 40).map((k) => ({ id: k.id, name: k.name })),
  };
}

const toEpisodeRef = (e: RawEpisode | null | undefined): EpisodeRefDTO | null =>
  e
    ? {
        id: e.id,
        seasonNumber: e.season_number,
        episodeNumber: e.episode_number,
        name: e.name ?? `Episode ${e.episode_number}`,
        airDate: dateOrNull(e.air_date),
        runtime: positiveOrNull(e.runtime),
        stillPath: str(e.still_path),
      }
    : null;

const toSeasonSummary = (s: RawSeasonSummary): SeasonSummaryDTO => ({
  id: s.id,
  seasonNumber: s.season_number,
  name: s.name ?? `Season ${s.season_number}`,
  episodeCount: s.episode_count ?? 0,
  airDate: dateOrNull(s.air_date),
  posterPath: str(s.poster_path),
  overview: s.overview ?? "",
  rating: ratingOf(s.vote_average, undefined),
});

export function toTv(raw: RawTv): TvDTO {
  const firstAirDate = dateOrNull(raw.first_air_date);
  const lastAirDate = dateOrNull(raw.last_air_date);
  const ended = raw.status === "Ended" || raw.status === "Canceled";
  const us = raw.content_ratings?.results?.find((r) => r.iso_3166_1 === "US");
  const aggCast = toAggregateCast(raw.aggregate_credits?.cast);
  const seasons = (raw.seasons ?? []).map(toSeasonSummary);
  return {
    ...detailBase(raw, "tv", raw.name, raw.original_name, firstAirDate),
    mediaType: "tv",
    firstAirDate,
    lastAirDate,
    endYear: ended ? yearOf(lastAirDate) : null,
    showType: str(raw.type),
    inProduction: !!raw.in_production,
    ended,
    contentRating: str(us?.rating),
    episodeRuntime: positiveOrNull(raw.episode_run_time?.[0]) ?? positiveOrNull(raw.last_episode_to_air?.runtime),
    numberOfSeasons: raw.number_of_seasons ?? 0,
    numberOfEpisodes: raw.number_of_episodes ?? 0,
    seasons: [...seasons.filter((s) => s.seasonNumber > 0), ...seasons.filter((s) => s.seasonNumber <= 0)],
    lastEpisodeToAir: toEpisodeRef(raw.last_episode_to_air),
    nextEpisodeToAir: toEpisodeRef(raw.next_episode_to_air),
    networks: (raw.networks ?? []).map(toNetwork),
    createdBy: (raw.created_by ?? []).map((c) => ({ id: c.id, name: c.name, profilePath: str(c.profile_path) })),
    originCountry: raw.origin_country ?? [],
    // Aggregate credits cover the whole run; fall back to the current-season credits.
    cast: aggCast.length ? aggCast : toCast(raw.credits?.cast),
    crew: raw.aggregate_credits?.crew?.length ? toAggregateCrew(raw.aggregate_credits.crew) : toCrew(raw.credits?.crew),
    keywords: (raw.keywords?.results ?? []).slice(0, 40).map((k) => ({ id: k.id, name: k.name })),
  };
}

export function toSeason(raw: RawSeason, tvId: number): SeasonDTO {
  return {
    id: raw.id,
    tvId,
    seasonNumber: raw.season_number,
    name: raw.name ?? `Season ${raw.season_number}`,
    overview: raw.overview ?? "",
    airDate: dateOrNull(raw.air_date),
    posterPath: str(raw.poster_path),
    episodes: (raw.episodes ?? []).map(
      (e): EpisodeDTO => ({
        id: e.id,
        seasonNumber: e.season_number,
        episodeNumber: e.episode_number,
        name: e.name ?? `Episode ${e.episode_number}`,
        overview: e.overview ?? "",
        stillPath: str(e.still_path),
        airDate: dateOrNull(e.air_date),
        runtime: positiveOrNull(e.runtime),
        rating: ratingOf(e.vote_average, e.vote_count),
      }),
    ),
  };
}

export function toCollection(raw: RawCollection): CollectionDTO {
  const parts = toCards(raw.parts, "movie", true).sort((a, b) => {
    if (!a.releaseDate) return 1;
    if (!b.releaseDate) return -1;
    return a.releaseDate.localeCompare(b.releaseDate);
  });
  const ref: CollectionRefDTO = { id: raw.id, name: raw.name, posterPath: str(raw.poster_path), backdropPath: str(raw.backdrop_path) };
  return { ...ref, overview: raw.overview ?? "", parts };
}

/* ------------------------------------------------------------------------ */
/* Person                                                                    */
/* ------------------------------------------------------------------------ */

/** Cached part of a person: everything except the date-dependent rails. */
export interface PersonBaseDTO {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  profilePath: string | null;
  profiles: string[];
  homepage: string | null;
  popularity: number;
  alsoKnownAs: string[];
  externalIds: ExternalIdsDTO;
  /** Every credit, merged per department + title */
  credits: PersonCreditDTO[];
  /** Internal ranking inputs, keyed `${department}|${mediaType}:${id}` */
  weights: Record<string, number>;
}

/** Talk shows and news: appearances there are not "known for" material. */
const SELF_GENRES = new Set([10767, 10763]);
const isSelfRole = (character: string | null | undefined) =>
  !!character && /^(self|himself|herself|themselves|narrator \(voice\)|host)\b/i.test(character.trim());

export function toPersonBase(raw: RawPerson): PersonBaseDTO {
  const merged = new Map<string, PersonCreditDTO & { roles: string[] }>();
  const weights: Record<string, number> = {};

  const add = (c: RawPersonCredit, department: string, role: string | null, billingWeight: number) => {
    const card = toCard(c, undefined, false);
    if (!card) return;
    const key = `${department}|${card.mediaType}:${card.id}`;
    const existing = merged.get(key);
    if (existing) {
      if (role && !existing.roles.includes(role)) existing.roles.push(role);
      if (c.episode_count) existing.episodeCount = (existing.episodeCount ?? 0) + c.episode_count;
      weights[key] = Math.max(weights[key] ?? 0, billingWeight);
      return;
    }
    merged.set(key, { ...card, role: null, department, roles: role ? [role] : [], ...(c.episode_count ? { episodeCount: c.episode_count } : {}) });
    weights[key] = billingWeight;
  };

  for (const c of raw.combined_credits?.cast ?? []) {
    if (c.adult) continue;
    const character = str(c.character);
    let w = typeof c.order === "number" ? (c.order <= 5 ? 1 : c.order <= 15 ? 0.6 : c.order <= 40 ? 0.3 : 0.1) : 0.6;
    if (c.media_type === "tv") w *= (c.episode_count ?? 0) >= 5 ? 1 : (c.episode_count ?? 0) >= 2 ? 0.5 : 0.25;
    if (isSelfRole(character) || (c.genre_ids ?? []).some((g) => SELF_GENRES.has(g))) w *= 0.05;
    add(c, "Acting", character, w);
  }
  for (const c of raw.combined_credits?.crew ?? []) {
    if (c.adult) continue;
    const job = str(c.job);
    let w = c.job === "Director" || c.job === "Screenplay" || c.job === "Creator" || c.job === "Original Music Composer" ? 1 : 0.6;
    if (c.media_type === "tv") w *= (c.episode_count ?? 0) >= 3 || c.job === "Creator" ? 1 : 0.4;
    add(c, str(c.department) ?? "Crew", job, w);
  }

  const credits: PersonCreditDTO[] = [...merged.values()].map(({ roles, ...credit }) => ({
    ...credit,
    role: roles.length ? roles.slice(0, 3).join(", ") : null,
  }));

  const profiles = [...(raw.images?.profiles ?? [])].sort(byVotes).map((p) => p.file_path);
  const profilePath = str(raw.profile_path);
  return {
    id: raw.id,
    name: raw.name,
    biography: (raw.biography ?? "").trim(),
    birthday: dateOrNull(raw.birthday),
    deathday: dateOrNull(raw.deathday),
    placeOfBirth: str(raw.place_of_birth),
    knownForDepartment: str(raw.known_for_department),
    profilePath,
    profiles: [...new Set([profilePath, ...profiles].filter((p): p is string => !!p))].slice(0, 8),
    homepage: str(raw.homepage),
    popularity: round2(raw.popularity),
    alsoKnownAs: (raw.also_known_as ?? []).slice(0, 6),
    externalIds: toExternalIds(raw.external_ids, raw.imdb_id),
    credits,
    weights,
  };
}
