import "server-only";
import type { Cast, Episode, Genre, Movie, MovieDetails, Season, SeriesDetails } from "@/types";
import type { CardDTO, MovieDTO, PersonCardDTO, SeasonDTO, TvDTO } from "./types";

/**
 * DTO -> old raw-TMDB-shaped objects, only for the compatibility facade in
 * lib/tmdb.ts and the snake_case aliases on API rows. Delete this file when
 * the pages stop using the `tmdb` object and @/types media shapes.
 */

export interface LegacyCardFields {
  media_type: "movie" | "tv";
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  vote_count: number;
  popularity: number;
  genre_ids: number[];
  overview: string;
  release_date?: string;
  first_air_date?: string;
}

/** snake_case fields older consumers read (SearchModal, MediaCard, client list pages). */
export function legacyCardFields(card: CardDTO): LegacyCardFields {
  const base: LegacyCardFields = {
    media_type: card.mediaType,
    poster_path: card.posterPath,
    backdrop_path: card.backdropPath,
    vote_average: card.rating ?? 0,
    vote_count: card.voteCount ?? 0,
    popularity: card.popularity ?? 0,
    genre_ids: card.genreIds,
    overview: card.overview ?? "",
  };
  if (card.mediaType === "movie") base.release_date = card.releaseDate ?? "";
  else {
    base.name = card.title;
    base.first_air_date = card.releaseDate ?? "";
  }
  return base;
}

/** A CardDTO with the legacy aliases merged in (CardDTO fields win). */
export const withLegacyFields = (card: CardDTO): CardDTO & LegacyCardFields => ({ ...legacyCardFields(card), ...card });

export interface LegacyPersonFields {
  media_type: "person";
  name: string;
  profile_path: string | null;
  known_for_department: string | null;
  known_for: { title: string }[];
  popularity: number;
}

export const withLegacyPersonFields = (p: PersonCardDTO): PersonCardDTO & LegacyPersonFields => ({
  media_type: "person",
  profile_path: p.profilePath,
  known_for_department: p.knownForDepartment,
  known_for: p.knownFor.map((title) => ({ title })),
  ...p,
  popularity: p.popularity ?? 0,
});

export const toLegacyMovie = (card: CardDTO): Movie & { media_type: "movie" } => ({
  media_type: "movie",
  id: card.id,
  title: card.title,
  overview: card.overview ?? "",
  poster_path: card.posterPath,
  backdrop_path: card.backdropPath,
  vote_average: card.rating ?? 0,
  genre_ids: card.genreIds,
  popularity: card.popularity ?? 0,
  release_date: card.releaseDate ?? "",
});

/** List items never carried seasons or credits; the old code cast them the same way. */
export const toLegacySeriesItem = (card: CardDTO): SeriesDetails =>
  ({
    id: card.id,
    name: card.title,
    overview: card.overview ?? "",
    poster_path: card.posterPath,
    backdrop_path: card.backdropPath,
    vote_average: card.rating ?? 0,
    genre_ids: card.genreIds,
    popularity: card.popularity ?? 0,
    first_air_date: card.releaseDate ?? "",
    media_type: "tv",
  }) as unknown as SeriesDetails;

export const toLegacyCard = (card: CardDTO): Movie | SeriesDetails =>
  card.mediaType === "movie" ? toLegacyMovie(card) : toLegacySeriesItem(card);

const legacyCast = (dto: MovieDTO | TvDTO): Cast[] =>
  dto.cast.map((c) => ({ id: c.id, name: c.name, character: c.character ?? "", profile_path: c.profilePath }));

const legacyGenres = (dto: MovieDTO | TvDTO): Genre[] => dto.genres.map((g) => ({ id: g.id, name: g.name }));

export const toLegacyMovieDetails = (dto: MovieDTO): MovieDetails => ({
  id: dto.id,
  title: dto.title,
  overview: dto.overview,
  poster_path: dto.posterPath,
  backdrop_path: dto.backdropPath,
  vote_average: dto.rating ?? 0,
  genre_ids: dto.genres.map((g) => g.id),
  popularity: dto.popularity,
  release_date: dto.releaseDate ?? "",
  runtime: dto.runtime ?? 0,
  credits: { cast: legacyCast(dto) },
  genres: legacyGenres(dto),
  production_countries: dto.productionCountries.map((c) => ({ name: c.name })),
});

export const toLegacyEpisodes = (season: SeasonDTO | null): Episode[] =>
  (season?.episodes ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    overview: e.overview,
    episode_number: e.episodeNumber,
    still_path: e.stillPath,
    air_date: e.airDate ?? "",
    runtime: e.runtime ?? 0,
    vote_average: e.rating ?? 0,
  }));

export function toLegacySeriesDetails(dto: TvDTO, season?: SeasonDTO | null): SeriesDetails {
  const last = dto.lastEpisodeToAir;
  const lastEpisode = {
    episode_number: last?.episodeNumber ?? 0,
    air_date: last?.airDate ?? "",
    season_number: last?.seasonNumber ?? 0,
    runtime: last?.runtime ?? dto.episodeRuntime ?? 0,
  };
  const seasons: Season[] = dto.seasons.map((s) => ({
    id: s.id,
    name: s.name,
    season_number: s.seasonNumber,
    episode_count: s.episodeCount,
    air_date: s.airDate ?? undefined,
    overview: s.overview,
    episodes: season && season.seasonNumber === s.seasonNumber ? toLegacyEpisodes(season) : [],
    last_episode_to_air: lastEpisode,
  }));
  return {
    id: dto.id,
    name: dto.title,
    overview: dto.overview,
    first_air_date: dto.firstAirDate ?? "",
    vote_average: dto.rating ?? 0,
    poster_path: dto.posterPath,
    backdrop_path: dto.backdropPath,
    genre_ids: dto.genres.map((g) => g.id),
    popularity: dto.popularity,
    episode_run_time: dto.episodeRuntime ? [dto.episodeRuntime] : [],
    seasons,
    last_episode_to_air: lastEpisode,
    genres: legacyGenres(dto),
    credits: { cast: legacyCast(dto) },
    production_countries: dto.productionCountries.map((c) => ({ name: c.name })),
  };
}
