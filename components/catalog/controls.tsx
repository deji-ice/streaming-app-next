import type { GenreDTO } from "@/lib/tmdb/types";

import { GenreChips } from "./genre-chips";
import { sortOptions, type CatalogQuery, type CatalogSort, type CatalogType } from "./params";
import { SortSelect } from "./sort-select";
import { TypeTabs } from "./type-tabs";

export interface CatalogControlsProps {
  /** The media type the page shows (decides the genre list and the sort labels). */
  type: CatalogType;
  /** Show Movies | Series tabs. Leave off for pages with one type. */
  withTabs?: boolean;
  /** Path of the page, for example /movie. */
  basePath: string;
  /** Params every control keeps (type, sort, genres), without `page`. */
  query: CatalogQuery;
  sort: CatalogSort;
  genres: readonly GenreDTO[];
  selected: readonly number[];
}

/**
 * Sort, genre chips and (optionally) the type tabs.
 * Without tabs the sort pill and the chips share one row from md up (the
 * listing pages); with tabs the tabs and the sort share the first row and
 * the chips get their own row (browse pages).
 */
export function CatalogControls({
  type,
  withTabs = false,
  basePath,
  query,
  sort,
  genres,
  selected,
}: CatalogControlsProps) {
  const sortControl = <SortSelect options={sortOptions(type)} value={sort} basePath={basePath} query={query} />;
  const chips = <GenreChips genres={genres} selected={selected} basePath={basePath} query={query} />;

  if (withTabs) {
    return (
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
          <TypeTabs value={type} basePath={basePath} query={query} />
          {sortControl}
        </div>
        {chips}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-start md:gap-4">
      <div className="md:shrink-0">{sortControl}</div>
      <div className="min-w-0 md:flex-1">{chips}</div>
    </div>
  );
}
