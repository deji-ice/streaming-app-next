/**
 * DTOs returned by every lib/tmdb loader. Raw TMDB objects never leave
 * lib/tmdb: loaders trim them to these shapes before caching, so cached
 * entries stay small and client props only carry what the UI renders.
 *
 * This file holds types only (no runtime code, no secrets), so client
 * components may import types from it with `import type`.
 */

export type MediaType = "movie" | "tv";

/** One card in a rail or grid (lists, discover, recommendations, search). */
export interface CardDTO {
  id: number;
  mediaType: MediaType;
  /** movie.title or tv.name */
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  year: number | null;
  /** TMDB vote_average rounded to 1 decimal; null when there are no votes. */
  rating: number | null;
  genreIds: number[];
  overview?: string;
  /** movie.release_date or tv.first_air_date (YYYY-MM-DD), null when unknown */
  releaseDate?: string | null;
  popularity?: number;
  voteCount?: number;
}

/** A person row in search results (CardDTO-like, with mediaType "person"). */
export interface PersonCardDTO {
  id: number;
  mediaType: "person";
  /** Same as name, so rows can be rendered generically. */
  title: string;
  name: string;
  profilePath: string | null;
  knownForDepartment: string | null;
  /** Titles of up to 3 known-for credits. */
  knownFor: string[];
  popularity?: number;
}

export interface Paged<T> {
  page: number;
  totalPages: number;
  totalResults: number;
  results: T[];
}

export interface GenreDTO {
  id: number;
  name: string;
}

/** Matches components/ds/trailer VideoItem. YouTube only. */
export interface VideoDTO {
  key: string;
  name: string;
  type: string;
  official: boolean;
  publishedAt: string | null;
}

/** Matches components/ds/cast-crew CastMember. */
export interface CastMemberDTO {
  id: number;
  name: string;
  profilePath: string | null;
  character: string | null;
  order: number;
  /** TV only: total episodes across the run (aggregate_credits). */
  episodeCount?: number;
}

/** Matches components/ds/cast-crew CrewMember. */
export interface CrewMemberDTO {
  id: number;
  name: string;
  profilePath: string | null;
  job: string;
  department: string;
  /** TV only: total episodes across the run (aggregate_credits). */
  episodeCount?: number;
}

/** Small reference to a person (directors, writers, creators). */
export interface PersonRefDTO {
  id: number;
  name: string;
  profilePath: string | null;
  /** e.g. "Director", "Screenplay, Story" */
  job?: string;
}

export interface ImageDTO {
  path: string;
  width: number;
  height: number;
  /** ISO 639-1 language, null for textless images */
  lang: string | null;
}

export interface CompanyDTO {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string | null;
}

export interface NetworkDTO {
  id: number;
  name: string;
  logoPath: string | null;
  originCountry: string | null;
}

export interface CountryDTO {
  /** ISO 3166-1 */
  code: string;
  name: string;
}

export interface LanguageDTO {
  /** ISO 639-1 */
  code: string;
  name: string;
}

export interface KeywordDTO {
  id: number;
  name: string;
}

export interface ExternalIdsDTO {
  imdbId: string | null;
  wikidataId: string | null;
  facebookId: string | null;
  instagramId: string | null;
  twitterId: string | null;
  tiktokId: string | null;
  youtubeId: string | null;
}

/** A streaming service in a watch-providers block. */
export interface ProviderDTO {
  id: number;
  name: string;
  logoPath: string | null;
  /** Slug of the curated /browse/{slug} page when this provider is curated, else null. */
  slug: string | null;
}

/** Where to watch one title in one region (JustWatch data via TMDB; credit JustWatch). */
export interface WatchProvidersDTO {
  /** ISO 3166-1 region code */
  region: string;
  /** TMDB watch page for this title and region (link to it, per JustWatch/TMDB terms) */
  link: string | null;
  flatrate: ProviderDTO[];
  free: ProviderDTO[];
  ads: ProviderDTO[];
  rent: ProviderDTO[];
  buy: ProviderDTO[];
}

/**
 * Compact all-regions index stored inside MovieDTO/TvDTO (about 15 KB instead
 * of about 60 KB). Read one region with selectWatchProviders(index, region)
 * from lib/tmdb/providers.
 */
export interface WatchProvidersIndex {
  providers: Record<string, { name: string; logoPath: string | null }>;
  regions: Record<
    string,
    {
      link: string | null;
      flatrate: number[];
      free: number[];
      ads: number[];
      rent: number[];
      buy: number[];
    }
  >;
}

export interface CollectionRefDTO {
  id: number;
  name: string;
  posterPath: string | null;
  backdropPath: string | null;
}

export interface CollectionDTO extends CollectionRefDTO {
  overview: string;
  /** Parts sorted by release date (unreleased parts last). */
  parts: CardDTO[];
}

interface DetailBase {
  id: number;
  title: string;
  originalTitle: string;
  originalLanguage: string | null;
  tagline: string | null;
  overview: string;
  posterPath: string | null;
  backdropPath: string | null;
  /** Best English (or textless) title logo from images.logos */
  logo: ImageDTO | null;
  /** Up to 8 backdrop paths, textless first */
  backdrops: string[];
  year: number | null;
  rating: number | null;
  voteCount: number;
  popularity: number;
  status: string | null;
  homepage: string | null;
  genres: GenreDTO[];
  productionCompanies: CompanyDTO[];
  productionCountries: CountryDTO[];
  spokenLanguages: LanguageDTO[];
  /** Up to 150 billed cast, in billing order */
  cast: CastMemberDTO[];
  /** Up to 300 crew rows, deduped by person and job */
  crew: CrewMemberDTO[];
  /** YouTube only: trailers, then teasers, clips, featurettes, behind the scenes, others; official first */
  videos: VideoDTO[];
  /** First official English YouTube trailer (falls back to any trailer or teaser) */
  trailer: VideoDTO | null;
  keywords: KeywordDTO[];
  /** TMDB recommendations, falling back to similar when empty (up to 20) */
  recommendations: CardDTO[];
  watchProviders: WatchProvidersIndex;
  externalIds: ExternalIdsDTO;
}

export interface MovieDTO extends DetailBase {
  mediaType: "movie";
  releaseDate: string | null;
  /** minutes */
  runtime: number | null;
  /** US certification from release_dates (e.g. "PG-13"), null when none */
  certification: string | null;
  /** USD; null when TMDB has 0 */
  budget: number | null;
  /** USD; null when TMDB has 0 */
  revenue: number | null;
  collection: CollectionRefDTO | null;
  directors: PersonRefDTO[];
  /** Screenplay, Writer, Story, Novel, Characters... merged per person */
  writers: PersonRefDTO[];
}

export interface SeasonSummaryDTO {
  id: number;
  seasonNumber: number;
  name: string;
  episodeCount: number;
  airDate: string | null;
  posterPath: string | null;
  overview: string;
  rating: number | null;
}

export interface EpisodeRefDTO {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  airDate: string | null;
  runtime: number | null;
  stillPath: string | null;
}

export interface TvDTO extends DetailBase {
  mediaType: "tv";
  firstAirDate: string | null;
  lastAirDate: string | null;
  /** Year of last_air_date when the show has ended or was canceled */
  endYear: number | null;
  /** "Scripted", "Miniseries", "Reality"... */
  showType: string | null;
  inProduction: boolean;
  /** True when status is Ended or Canceled */
  ended: boolean;
  /** US content rating (e.g. "TV-MA"), null when none */
  contentRating: string | null;
  /** Typical episode runtime in minutes */
  episodeRuntime: number | null;
  numberOfSeasons: number;
  numberOfEpisodes: number;
  /** Specials (season 0) last */
  seasons: SeasonSummaryDTO[];
  lastEpisodeToAir: EpisodeRefDTO | null;
  nextEpisodeToAir: EpisodeRefDTO | null;
  networks: NetworkDTO[];
  createdBy: PersonRefDTO[];
  originCountry: string[];
}

export interface EpisodeDTO {
  id: number;
  seasonNumber: number;
  episodeNumber: number;
  name: string;
  overview: string;
  stillPath: string | null;
  airDate: string | null;
  runtime: number | null;
  rating: number | null;
}

export interface SeasonDTO {
  id: number;
  tvId: number;
  seasonNumber: number;
  name: string;
  overview: string;
  airDate: string | null;
  posterPath: string | null;
  episodes: EpisodeDTO[];
}

/** One title in a person's filmography. */
export interface PersonCreditDTO extends CardDTO {
  /** Character (acting) or job(s) (crew), merged when one title has several */
  role: string | null;
  /** "Acting", "Directing", "Writing", "Production", "Sound"... */
  department: string;
  /** TV only */
  episodeCount?: number;
}

export interface PersonCreditGroupDTO {
  department: string;
  credits: PersonCreditDTO[];
}

export interface PersonDTO {
  id: number;
  name: string;
  biography: string;
  /** YYYY-MM-DD */
  birthday: string | null;
  deathday: string | null;
  placeOfBirth: string | null;
  knownForDepartment: string | null;
  profilePath: string | null;
  /** Up to 8 profile image paths */
  profiles: string[];
  homepage: string | null;
  popularity: number;
  alsoKnownAs: string[];
  externalIds: ExternalIdsDTO;
  /** Top 12 by vote count weighted by popularity and billing, deduped by id+type */
  knownFor: PersonCreditDTO[];
  /** Most recent released credits, newest first (up to 20) */
  latest: PersonCreditDTO[];
  /** Credits dated after today, soonest first, then announced credits without a date (releaseDate null) */
  upcoming: PersonCreditDTO[];
  /** Every credit grouped by department (Acting first, then by size). Each group sorted newest first, undated first. */
  credits: PersonCreditGroupDTO[];
}

/** Phosphor icon names from design spec section 3 used by facts. */
export type FactIcon =
  | "Trophy"
  | "CurrencyDollarSimple"
  | "BookOpenText"
  | "MapPin"
  | "GlobeHemisphereWest"
  | "MusicNotes"
  | "VideoCamera"
  | "FilmSlate"
  | "Television"
  | "Info";

export interface Fact {
  /** Stable id, e.g. "awards-won", "box-office" */
  id: string;
  /** Short label, e.g. "Awards" */
  label: string;
  /** One human-readable line (no em or en dashes) */
  value: string;
  /** Phosphor icon name */
  icon: FactIcon;
  source: "wikidata" | "tmdb";
  sourceUrl: string;
}
