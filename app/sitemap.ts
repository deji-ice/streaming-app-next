import type { MetadataRoute } from "next";

import { hasDonations } from "@/lib/donate";
import { absoluteUrl } from "@/lib/site";
import { mediaHref, providerHref } from "@/lib/slug";
import { getMovieList, getNowPlayingMovies, getTrending, getTvList } from "@/lib/tmdb/lists";
import { CURATED_PROVIDERS } from "@/lib/tmdb/providers";
import type { CardDTO } from "@/lib/tmdb/types";

/**
 * A deliberately small sitemap (about 150 URLs): the main pages, the streaming service
 * pages, and the movies and series the home page already shows. Search engines find these
 * anyway through the home page; listing them makes the move to streamscapex.app quicker to
 * pick up without inviting a crawl of every title.
 *
 * Left out on purpose: /person pages and deep catalog pages (each crawl is an uncached
 * render that calls TMDB, and crawlers on those pages ran up the Nov 2026 Cloudflare bill),
 * genre-filtered URLs (blocked in robots.txt), and the personal pages (history, watchlist,
 * favorites, profile, dashboard, recommendations, search) that have nothing to index.
 */
export const revalidate = 86400;

/** Same region as the home page's "New in theaters". */
const THEATERS_REGION = "US";

function cardsOf(result: PromiseSettledResult<{ results: readonly CardDTO[] }>): readonly CardDTO[] {
  return result.status === "fulfilled" ? result.value.results : [];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lists = await Promise.allSettled([
    getTrending("movie", "week"),
    getTrending("tv", "week"),
    getMovieList("popular"),
    getNowPlayingMovies(1, THEATERS_REGION),
    getTvList("popular"),
    getTvList("top_rated"),
  ]);

  const titles = new Map<string, string>();
  for (const card of lists.flatMap(cardsOf)) {
    const href = mediaHref(card.mediaType, card.id, card.title);
    if (!titles.has(href)) titles.set(href, absoluteUrl(href));
  }

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/movie"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/series"), changeFrequency: "daily", priority: 0.8 },
    { url: absoluteUrl("/browse"), changeFrequency: "weekly", priority: 0.6 },
    ...CURATED_PROVIDERS.map((provider) => ({
      url: absoluteUrl(providerHref(provider.slug)),
      changeFrequency: "daily" as const,
      priority: 0.6,
    })),
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.3 },
    ...(hasDonations ? [{ url: absoluteUrl("/donate"), changeFrequency: "yearly" as const, priority: 0.2 }] : []),
  ];

  return [
    ...pages,
    ...[...titles.values()].map((url) => ({ url, changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
