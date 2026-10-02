import type { Metadata } from "next";
import { Suspense } from "react";

import { discover, getGenres, normalizeSort } from "@/lib/tmdb";
import type { CardDTO, GenreDTO, Paged } from "@/lib/tmdb/types";

import { CatalogControls } from "./controls";
import { catalogMetadata, pickImage, type CatalogImageSource } from "./metadata";
import {
  canonicalSort,
  catalogCanonical,
  firstParam,
  MAX_PAGE,
  pageQuery,
  parseGenreIds,
  parsePage,
  type CatalogSort,
  type CatalogType,
  type RawSearchParams,
} from "./params";
import { ResultsSection } from "./results-section";
import { PageCountSkeleton, ResultsSkeleton } from "./skeletons";
import { catalogPage, catalogTitle } from "./styles";

/*
 * Shared body of /movie and /series (design spec 7.2).
 *
 * The page reads searchParams (sort, page, genres), so it renders per request;
 * the TMDB data underneath is cached (lib/tmdb, one hour for discover, a week
 * for genres). The title, the controls and the genre list render at once. The
 * "Page x of y" line and the grid sit in Suspense boundaries keyed by the
 * query, so changing the sort, a genre or the page shows a skeleton right away
 * instead of leaving the old list on screen until the new one arrives.
 */

const CONFIG = {
  movie: {
    title: "Movies",
    basePath: "/movie",
    noun: "movies",
    description: "Browse popular, top rated and new movies. Filter by genre and sort the list.",
  },
  tv: {
    title: "Series",
    basePath: "/series",
    noun: "series",
    description: "Browse popular, top rated and new TV series. Filter by genre and sort the list.",
  },
} as const satisfies Record<CatalogType, { title: string; basePath: string; noun: string; description: string }>;

interface ListingState {
  sort: CatalogSort;
  page: number;
  /** Selected genre ids that exist for this media type. */
  genres: number[];
}

/**
 * Reads the URL state. Genre ids are checked against the real genre list for
 * the media type, so arbitrary ids never reach TMDB or the cache.
 */
async function readListing(
  type: CatalogType,
  params: RawSearchParams,
): Promise<{ state: ListingState; genreList: GenreDTO[] }> {
  const genreList = await getGenres(type);
  const known = new Set(genreList.map((genre) => genre.id));
  return {
    genreList,
    state: {
      sort: canonicalSort(type, firstParam(params.sort)),
      page: parsePage(firstParam(params.page)),
      genres: parseGenreIds(firstParam(params.genres)).filter((id) => known.has(id)),
    },
  };
}

function loadListing(type: CatalogType, state: ListingState): Promise<Paged<CardDTO>> {
  return discover(type, { sort: normalizeSort(type, state.sort), page: state.page, genres: state.genres });
}

/** generateMetadata for /movie and /series. Never throws: the social image is optional. */
export async function listingMetadata(type: CatalogType, params: RawSearchParams): Promise<Metadata> {
  const config = CONFIG[type];
  const page = parsePage(firstParam(params.page));

  let image: CatalogImageSource | null = null;
  try {
    const { state } = await readListing(type, params);
    image = pickImage((await loadListing(type, state)).results);
  } catch {
    // The page itself reports the error; metadata just goes without artwork.
  }

  return catalogMetadata({
    title: config.title,
    description: config.description,
    canonical: catalogCanonical(config.basePath, { page }),
    image,
  });
}

async function PageCount({ page, load }: { page: number; load: () => Promise<Paged<CardDTO>> }) {
  const data = await load();
  const total = Math.min(data.totalPages, MAX_PAGE);
  return (
    <p className="mt-2 flex h-5 items-center text-sm tabular-nums text-muted-foreground">
      {total > 0 ? `Page ${page} of ${total}` : "No results"}
    </p>
  );
}

export async function ListingPage({ type, params }: { type: CatalogType; params: RawSearchParams }) {
  const config = CONFIG[type];
  const { state, genreList } = await readListing(type, params);
  const load = () => loadListing(type, state);

  const query = pageQuery({ sort: state.sort, genres: state.genres });
  const key = `${state.sort}|${state.genres.join(",")}|${state.page}`;
  const hasFilters = state.genres.length > 0;

  return (
    <div className={catalogPage}>
      <h1 className={catalogTitle}>{config.title}</h1>

      <Suspense key={key} fallback={<PageCountSkeleton />}>
        <PageCount page={state.page} load={load} />
      </Suspense>

      <div className="mt-6">
        <CatalogControls
          type={type}
          basePath={config.basePath}
          query={query}
          sort={state.sort}
          genres={genreList}
          selected={state.genres}
        />
      </div>

      <div className="mt-6 md:mt-8">
        <Suspense key={key} fallback={<ResultsSkeleton />}>
          <ResultsSection
            load={load}
            page={state.page}
            type={type}
            basePath={config.basePath}
            query={query}
            label={config.title}
            canClearFilters={hasFilters}
            priorityCount={1}
            empty={
              hasFilters
                ? {
                    title: `No ${config.noun} match these genres`,
                    body: "Selected genres are combined, so each one narrows the list. Remove a genre to see more.",
                  }
                : { title: `No ${config.noun} to show`, body: "The list is empty right now. Try again later." }
            }
          />
        </Suspense>
      </div>
    </div>
  );
}
