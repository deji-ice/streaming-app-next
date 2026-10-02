/**
 * Metadata for the catalog pages. A page that sets `openGraph` or `twitter`
 * replaces the root layout's whole object, so every field is set here.
 */
import type { Metadata } from "next";

import { tmdbImage } from "@/lib/tmdb-image";

const BRAND = "StreamScapeX";

export interface CatalogImageSource {
  backdropPath?: string | null;
  posterPath?: string | null;
}

export interface CatalogMetadataInput {
  /** Page title without the brand (the root template appends it). */
  title: string;
  description: string;
  /** Path and query relative to metadataBase, for example /movie?page=2. */
  canonical: string;
  /** TMDB artwork for the social card: a w780 backdrop, else a w500 poster. */
  image?: CatalogImageSource | null;
}

export function catalogMetadata({ title, description, canonical, image }: CatalogMetadataInput): Metadata {
  const imageUrl = tmdbImage(image?.backdropPath, "w780") ?? tmdbImage(image?.posterPath, "w500");
  const socialTitle = `${title} | ${BRAND}`;

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: "website",
      siteName: BRAND,
      locale: "en_US",
      url: canonical,
      title: socialTitle,
      description,
      images: imageUrl
        ? [{ url: imageUrl, alt: title }]
        : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: BRAND }],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl ?? "/twitter-image.jpg"],
    },
  };
}

/** The first card with a backdrop, else the first with a poster. */
export function pickImage(
  cards: ReadonlyArray<{ backdropPath: string | null; posterPath: string | null }>,
): CatalogImageSource | null {
  const withBackdrop = cards.find((card) => card.backdropPath);
  if (withBackdrop) return { backdropPath: withBackdrop.backdropPath };
  const withPoster = cards.find((card) => card.posterPath);
  return withPoster ? { posterPath: withPoster.posterPath } : null;
}
