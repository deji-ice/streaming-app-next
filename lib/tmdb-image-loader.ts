/**
 * next/image custom loader (next.config.ts images.loaderFile).
 *
 * - TMDB srcs (https://image.tmdb.org/t/p/{size}/{file}): the requested width
 *   is snapped UP to the nearest valid TMDB bucket
 *   [92, 154, 185, 300, 342, 500, 780, 1280]. Widths above 1280 get w1280,
 *   never `original` (originals are multi-megabyte). If the src already
 *   carries an explicit wN size, the result never exceeds it: the src is
 *   returned unchanged when the snapped bucket would be larger.
 * - Any other src (local /public files, YouTube thumbnails) is returned
 *   unchanged. Pass `unoptimized` on those images to skip the loader and the
 *   dev-only "loader does not implement width" warning.
 *
 * Every bucket was verified with live HEAD requests (200) for a poster, a
 * backdrop, a profile photo and a company logo, so the mapping is not
 * kind-aware. w640 returns 400 and is deliberately absent.
 *
 * Intentionally not a "use client" module: it must also run during server
 * rendering and in getImageProps() calls from Server Components.
 */

import type { ImageLoaderProps } from "next/image";

const BUCKETS = [92, 154, 185, 300, 342, 500, 780, 1280] as const;
const MAX_BUCKET = BUCKETS[BUCKETS.length - 1];
const TMDB_SRC = /^https?:\/\/image\.tmdb\.org\/t\/p\/([^/]+)(\/.+)$/i;

export default function tmdbImageLoader({ src, width }: ImageLoaderProps): string {
  const match = TMDB_SRC.exec(src);
  if (!match) return src;

  const [, size, file] = match;

  let cap = Number.POSITIVE_INFINITY;
  if (size !== "original") {
    const explicit = /^w(\d+)$/.exec(size);
    // Height-based (h632) or unknown sizes: leave the author's choice alone.
    if (!explicit) return src;
    cap = Number(explicit[1]);
  }

  const bucket = BUCKETS.find((b) => b >= width) ?? MAX_BUCKET;
  if (bucket >= cap) return src;

  return `https://image.tmdb.org/t/p/w${bucket}${file}`;
}
