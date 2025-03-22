export interface SeriesPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface MoviePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export interface VideoPlayerProps {
  tmdbId: number | string;
  type: "movie" | "series";
  posterPath: string;
  title: string;
  episode?: {
    season: number;
    number: number;
  };
  seasonLength?: number
}

export interface BaseMediaItem {
  id: number;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  genre_ids: number[];
  popularity: number;
}

export interface Movie extends BaseMediaItem {
  title: string;
  release_date: string;
  runtime?: number;
}

export interface Series extends BaseMediaItem {
  name: string;
  first_air_date: string;
  episode_run_time: number[];
  seasons: Season[];
}

export interface Season {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
  air_date?: string;
  overview?: string;
  episodes: Episode[];
}

export interface Episode {
  id: number;
  name: string;
  overview: string;
  episode_number: number;
  still_path: string | null;
  air_date: string;
  runtime: number;
  vote_average: number;
}

export interface Cast {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface Genre {
  id: number;
  name: string;
}

export interface MediaDetails {
  credits: {
    cast: Cast[];
  };
  genres: Genre[];
  production_countries: Array<{ name: string }>;
}

export interface MovieDetails extends Movie, MediaDetails { }
export interface SeriesDetails extends Series, MediaDetails {
  id: number;
  name: string;
  overview: string;
  first_air_date: string;
  vote_average: number;
  poster_path: string | null;
  backdrop_path: string | null;
  last_episode_to_air: {
    runtime: number;
  };
  genres: Array<{ id: number; name: string }>;
  credits: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  production_countries: Array<{ name: string }>;
  seasons: Season[];
}

export type MediaType = "movie" | "tv" | "series";

export type UserData = {
  id: string;
  email: string;
  favorites: number[];
  watchlist: number[];
  recentlyViewed: number[];
};