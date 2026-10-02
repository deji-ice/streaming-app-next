import Link from "next/link";
import { FilmSlateIcon, TelevisionIcon } from "@phosphor-icons/react/dist/ssr";

import { EmptyState } from "@/components/ds/empty-state";
import { buttonVariants } from "@/components/ui/button";
import type { CardDTO, Paged } from "@/lib/tmdb/types";

import { CatalogGrid } from "./catalog-grid";
import { CatalogPagination } from "./catalog-pagination";
import { catalogHref, MAX_PAGE, type CatalogQuery, type CatalogType } from "./params";

export interface EmptyCopy {
  title: string;
  body?: string;
}

export interface ResultsSectionProps {
  /** Loads the page of results. Runs inside a Suspense boundary, so the page shell does not wait for it. */
  load: () => Promise<Paged<CardDTO>>;
  /** Page number from the URL. */
  page: number;
  type: CatalogType;
  /** Path of the page, for example /movie. */
  basePath: string;
  /** Params every link keeps (sort, genres, type, region), without `page`. */
  query: CatalogQuery;
  /** Accessible name of the grid, for example "Movies". */
  label: string;
  /** Shown when the filters match nothing. */
  empty: EmptyCopy;
  /** Offer "Clear filters" in the empty state. */
  canClearFilters: boolean;
  /** Eager-loaded posters; 1 when the grid is in the first screen. */
  priorityCount?: number;
}

/**
 * The poster grid and its pagination, or an empty state. Async: the data is
 * awaited here, inside the caller's Suspense boundary.
 */
export async function ResultsSection({
  load,
  page,
  type,
  basePath,
  query,
  label,
  empty,
  canClearFilters,
  priorityCount = 0,
}: ResultsSectionProps) {
  const data = await load();
  const totalPages = Math.min(data.totalPages, MAX_PAGE);
  const Icon = type === "movie" ? FilmSlateIcon : TelevisionIcon;

  if (data.results.length === 0) {
    if (page > 1 && totalPages >= 1 && page > totalPages) {
      return (
        <EmptyState
          icon={<Icon weight="duotone" />}
          title="No titles on this page"
          body={`This list has ${totalPages} ${totalPages === 1 ? "page" : "pages"}.`}
          action={
            <Link
              href={catalogHref(basePath, { ...query, page: totalPages > 1 ? totalPages : undefined })}
              className={buttonVariants({ variant: "secondary" })}
            >
              {totalPages > 1 ? "Go to the last page" : "Go to the first page"}
            </Link>
          }
        />
      );
    }

    return (
      <EmptyState
        icon={<Icon weight="duotone" />}
        title={empty.title}
        body={empty.body}
        action={
          canClearFilters ? (
            <Link
              href={catalogHref(basePath, { ...query, genres: undefined })}
              className={buttonVariants({ variant: "secondary" })}
            >
              Clear filters
            </Link>
          ) : undefined
        }
      />
    );
  }

  return (
    <>
      <CatalogGrid items={data.results} label={label} priorityCount={priorityCount} />
      {totalPages > 1 ? (
        <div className="mt-10 md:mt-12">
          <CatalogPagination page={data.page} totalPages={totalPages} basePath={basePath} query={query} />
        </div>
      ) : null}
    </>
  );
}
