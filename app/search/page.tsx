import type { Metadata } from "next";
import { Suspense } from "react";

import { loadSearch } from "@/components/search/data";
import {
  hasQuery,
  parseSearchParams,
  searchHref,
  type RawSearchParams,
} from "@/components/search/params";
import { SearchBody } from "@/components/search/search-body";
import { SearchForm } from "@/components/search/search-form";
import { SearchPageFrame, SearchPrompt } from "@/components/search/search-page-frame";
import { SearchBodySkeleton } from "@/components/search/skeletons";
import { tmdbImage } from "@/lib/tmdb-image";

/**
 * /search is rendered on the server from the URL: q, type (all, movie, tv or
 * series, person), year, minRating and page. Tabs, filters and pagination are
 * plain links and a GET form, so everything works without JavaScript.
 */

interface SearchPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const state = parseSearchParams(await searchParams);
  const searched = hasQuery(state);
  // Any search state (even an empty or too short query) is a result page for indexing purposes.
  const isResultPage =
    state.q !== "" || state.year !== null || state.minRating !== null || state.type !== "all" || state.page > 1;

  const metadata: Metadata = {
    title: searched ? `Results for ${state.q}` : "Search",
    description: searched
      ? `Movies, series and people matching "${state.q}".`
      : "Search movies, series and people.",
    alternates: { canonical: searched ? searchHref(state) : "/search" },
    ...(isResultPage ? { robots: { index: false, follow: true } } : {}),
  };

  if (searched) {
    // Same cached TMDB calls as the page, so this costs no extra requests.
    const data = await loadSearch(state).catch(() => null);
    const first = data?.titles.find((title) => title.posterPath);
    const image = tmdbImage(first?.posterPath, "w500");
    if (first && image) {
      metadata.openGraph = {
        type: "website",
        siteName: "StreamScapeX",
        title: `Results for ${state.q}`,
        description: metadata.description ?? undefined,
        url: searchHref(state),
        images: [{ url: image, width: 500, height: 750, alt: first.title }],
      };
    }
  }

  return metadata;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const state = parseSearchParams(await searchParams);
  // A new key per URL state shows the fallback again on tab, filter and page changes.
  const key = searchHref(state);

  return (
    <SearchPageFrame>
      <SearchForm state={state} />
      {hasQuery(state) ? (
        <Suspense key={key} fallback={<SearchBodySkeleton state={state} />}>
          <SearchBody state={state} />
        </Suspense>
      ) : (
        <SearchPrompt state={state} />
      )}
    </SearchPageFrame>
  );
}
