import type { Metadata } from "next";

import { tmdbImage } from "@/lib/tmdb-image";

/**
 * Collapses whitespace and cuts the text to `max` characters at a word
 * boundary, ending with an ellipsis. Short text is returned unchanged.
 */
export function truncateText(text: string | null | undefined, max = 160): string {
  const clean = (text ?? "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  const base = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return `${base.replace(/[\s.,;:!?-]+$/, "")}…`;
}

export interface DetailMetadataInput {
  kind: "movie" | "tv";
  title: string;
  year: number | null;
  overview: string | null | undefined;
  /** Normalized slug URL, for example /movie/the-batman-414906 (no query string). */
  canonicalPath: string;
  backdropPath: string | null;
  posterPath: string | null;
}

/**
 * Metadata for a movie or series page: "{Title} ({year})" (the layout
 * template appends the brand), the overview as description, the canonical
 * slug URL and an Open Graph image from TMDB (w780 backdrop, else w500 poster).
 */
export function buildDetailMetadata(input: DetailMetadataInput): Metadata {
  const { kind, title, year, overview, canonicalPath, backdropPath, posterPath } = input;
  const pageTitle = year ? `${title} (${year})` : title;
  const description =
    truncateText(overview) || `Cast, crew, videos and streaming availability for ${title}.`;
  const backdrop = tmdbImage(backdropPath, "w780");
  const image = backdrop ?? tmdbImage(posterPath, "w500");

  return {
    title: pageTitle,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      type: kind === "movie" ? "video.movie" : "video.tv_show",
      title: pageTitle,
      description,
      url: canonicalPath,
      images: image ? [{ url: image, alt: title }] : undefined,
    },
    twitter: {
      card: backdrop ? "summary_large_image" : "summary",
      title: pageTitle,
      description,
      images: image ? [image] : undefined,
    },
  };
}
