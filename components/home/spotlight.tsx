import "server-only";

import { formatRuntime } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import { getMovie } from "@/lib/tmdb/details";
import type { CardDTO, GenreDTO, MovieDTO } from "@/lib/tmdb/types";

import { SpotlightIsland } from "./spotlight-island";
import type { SpotlightItem } from "./types";

/** How many trending movies the spotlight offers. */
export const SPOTLIGHT_COUNT = 5;
/** Videos kept per title for the trailer modal (trailers come first). */
const MAX_VIDEOS = 6;
const MAX_GENRES = 2;

type CardWithBackdrop = CardDTO & { backdropPath: string };

function toSpotlightItem(
  card: CardWithBackdrop,
  details: MovieDTO | null,
  genreNames: ReadonlyMap<number, string>,
): SpotlightItem {
  const title = details?.title ?? card.title;
  const logo = details?.logo;
  const genres = details?.genres.length
    ? details.genres.map((genre) => genre.name)
    : card.genreIds.flatMap((id) => {
        const name = genreNames.get(id);
        return name ? [name] : [];
      });

  return {
    id: card.id,
    title,
    href: mediaHref("movie", card.id, title),
    year: details?.year ?? card.year,
    certification: details?.certification ?? null,
    runtime: formatRuntime(details?.runtime),
    genres: genres.slice(0, MAX_GENRES),
    overview: (details?.overview || card.overview || "").trim(),
    backdropPath: details?.backdropPath ?? card.backdropPath,
    logo:
      logo && logo.width > 0 && logo.height > 0
        ? { path: logo.path, width: logo.width, height: logo.height }
        : null,
    videos: (details?.videos ?? []).slice(0, MAX_VIDEOS).map((video) => ({
      key: video.key,
      name: video.name,
      type: video.type,
      official: video.official,
    })),
  };
}

/**
 * The top trending movies that have a backdrop, enriched with their details
 * (title logo, certification, runtime, genres, videos). The details come from
 * the cached getMovie loader and are fetched in parallel. A title whose
 * details call fails still shows up, with what the trending row already has.
 * Never throws.
 */
export async function loadSpotlightItems(
  cards: readonly CardDTO[],
  genres: readonly GenreDTO[],
): Promise<SpotlightItem[]> {
  const picked = cards
    .filter((card): card is CardWithBackdrop => card.mediaType === "movie" && !!card.backdropPath)
    .slice(0, SPOTLIGHT_COUNT);
  const settled = await Promise.allSettled(picked.map((card) => getMovie(card.id)));
  const genreNames = new Map(genres.map((genre) => [genre.id, genre.name] as const));

  return picked.map((card, index) => {
    const result = settled[index];
    if (result.status === "rejected") {
      console.warn(`[home] Spotlight details failed for movie ${card.id}`, result.reason);
    }
    return toSpotlightItem(card, result.status === "fulfilled" ? result.value : null, genreNames);
  });
}

/**
 * Server shell of the home hero. All the interactive state (which of the
 * titles is shown) lives in the client island; switching never makes a request.
 */
export function Spotlight({ items }: { items: SpotlightItem[] }) {
  if (items.length === 0) return null;

  return (
    <section
      aria-label="Spotlight"
      className="mx-auto max-w-[1440px] px-gutter pb-4 pt-4 md:pb-6 md:pt-8"
    >
      <SpotlightIsland items={items} />
    </section>
  );
}
