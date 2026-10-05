/**
 * Props shared between the server side of the home spotlight (spotlight.tsx,
 * which talks to TMDB) and its client island (spotlight-island.tsx).
 *
 * Plain data only, no imports from lib/tmdb: the island must stay free of
 * server code, and these are the only fields it renders. Never pass a whole
 * MovieDTO to the client.
 */

/** A trimmed YouTube video for the trailer modal (matches components/ds/video-utils VideoItem). */
export interface SpotlightVideo {
  key: string;
  name: string;
  type: string;
  official?: boolean;
}

/** TMDB title logo. width and height are the original image size and give the aspect ratio. */
export interface SpotlightLogo {
  path: string;
  width: number;
  height: number;
}

export interface SpotlightItem {
  id: number;
  title: string;
  /** /movie/{slug}-{id}, built on the server with mediaHref. */
  href: string;
  year: number | null;
  /** US certification such as "PG-13". */
  certification: string | null;
  /** Already formatted, for example "2h 16m". */
  runtime: string | null;
  /** At most two genre names. */
  genres: string[];
  overview: string;
  backdropPath: string;
  logo: SpotlightLogo | null;
  /** Trailers first. Empty when the details call failed or TMDB has none. */
  videos: SpotlightVideo[];
}

/** One tile of the "Browse by genre" grid. */
export interface GenreTileData {
  id: number;
  name: string;
  backdropPath: string | null;
}
