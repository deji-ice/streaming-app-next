/**
 * TMDB image URL helpers. Client-safe: no secrets, no server-only imports.
 *
 * Always build the `original` URL with `tmdbImage(path)` and hand it to
 * next/image together with a `sizes` value from IMAGE_SIZES. The custom
 * loader (lib/tmdb-image-loader.ts) rewrites it to the right TMDB bucket
 * (w92 ... w1280) for every srcset candidate.
 */

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

/** Size segments TMDB accepts. w640 is NOT valid (it returns 400). */
export type TmdbImageSize =
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w342"
  | "w500"
  | "w780"
  | "w1280"
  | "original";

/** Widths the loader snaps to, ascending. Verified 200 for posters, backdrops, profiles and logos. */
export const TMDB_WIDTH_BUCKETS = [92, 154, 185, 300, 342, 500, 780, 1280] as const;

/**
 * Returns `${TMDB_IMAGE_BASE}/${size}${path}`, or null when path is falsy.
 * Absolute URLs (already resolved) are returned unchanged.
 */
export function tmdbImage(
  path: string | null | undefined,
  size: TmdbImageSize = "original",
): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path)) return path;
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${TMDB_IMAGE_BASE}/${size}${normalized}`;
}

/** `sizes` attribute values per image slot (design spec section 4). */
export const IMAGE_SIZES = {
  posterRail:
    "(min-width:1280px) 208px, (min-width:1024px) 192px, (min-width:768px) 176px, (min-width:640px) 152px, 128px",
  posterGrid:
    "(min-width:1536px) 14vw, (min-width:1280px) 16vw, (min-width:1024px) 20vw, (min-width:768px) 25vw, (min-width:640px) 33vw, 50vw",
  landscapeRail: "(min-width:1024px) 320px, (min-width:640px) 280px, 75vw",
  heroBackdrop: "(min-width:1024px) 60vw, 100vw",
  detailBackdrop: "(min-width:1280px) 1100px, 100vw",
  player: "(min-width:1280px) 1100px, 100vw",
  avatar: "96px",
  logo: "160px",
} as const;

export type ImageSlot = keyof typeof IMAGE_SIZES;
