import { Suspense, type ReactNode } from "react";

import { getGenres } from "@/lib/tmdb";
import type { CardDTO, GenreDTO, Paged } from "@/lib/tmdb/types";

import { CatalogControls } from "./controls";
import { pickImage, type CatalogImageSource } from "./metadata";
import {
  canonicalSort,
  firstParam,
  pageQuery,
  parseGenreIds,
  parsePage,
  parseType,
  type CatalogQuery,
  type CatalogSort,
  type CatalogType,
  type RawSearchParams,
} from "./params";
import { ResultsSection, type EmptyCopy } from "./results-section";
import { ResultsSkeleton } from "./skeletons";
import { catalogPageBottom, catalogPageTop } from "./styles";

/*
 * The shared template of the streaming provider, studio and network pages
 * (design spec 7.6): a header, an optional full-bleed rail, the controls
 * (type tabs, sort, genre chips), the poster grid and the pagination.
 *
 * Like the listing pages, these read searchParams and render per request on
 * top of cached TMDB data. The header, rail and controls render at once; the
 * grid sits in a Suspense boundary keyed by the query so every change of
 * type, sort, genre or page shows a skeleton immediately.
 */

export interface EntityFilters {
  sort: CatalogSort;
  page: number;
  genres: number[];
}

export type EntityLoader = (type: CatalogType, filters: EntityFilters) => Promise<Paged<CardDTO>>;

export interface EntityConfig {
  /** Path of the page without a query, for example /browse/netflix. */
  basePath: string;
  /** Media types the page offers, default first. One type means no tabs. */
  types: readonly [CatalogType, ...CatalogType[]];
  /**
   * When the URL does not name a type, open the first one that has titles
   * (a studio that only makes series would otherwise land on an empty
   * Movies tab). Only checked on page 1 without genres.
   */
  autoType?: boolean;
  /** Loads one page of titles. Sort is already one of the three UI sorts. */
  load: EntityLoader;
}

export interface EntityState {
  type: CatalogType;
  sort: CatalogSort;
  page: number;
  /** Selected genre ids that exist for `type`. */
  genres: number[];
  /** Params every link on the page keeps, without `page`. */
  query: CatalogQuery;
}

async function firstTypeWithTitles(config: EntityConfig, rawSort: string): Promise<CatalogType> {
  for (const candidate of config.types) {
    const probe = await config.load(candidate, {
      sort: canonicalSort(candidate, rawSort),
      page: 1,
      genres: [],
    });
    if (probe.results.length > 0) return candidate;
  }
  return config.types[0];
}

/**
 * Reads the URL state: type, sort, page, genres. Genre ids are checked
 * against the real list for the type. Loader calls are cached per request,
 * so calling this from generateMetadata and from the page costs nothing extra.
 */
export async function resolveEntity(
  config: EntityConfig,
  params: RawSearchParams,
): Promise<{ state: EntityState; genreList: GenreDTO[] }> {
  const { types } = config;
  const requested = parseType(firstParam(params.type));
  const explicit = requested !== null && types.includes(requested);
  const page = parsePage(firstParam(params.page));
  const rawGenres = parseGenreIds(firstParam(params.genres));
  const rawSort = firstParam(params.sort);

  let type: CatalogType = explicit && requested ? requested : types[0];
  if (!explicit && config.autoType && types.length > 1 && page === 1 && rawGenres.length === 0) {
    type = await firstTypeWithTitles(config, rawSort);
  }

  const genreList = await getGenres(type);
  const known = new Set(genreList.map((genre) => genre.id));
  const genres = rawGenres.filter((id) => known.has(id));
  const sort = canonicalSort(type, rawSort);

  return {
    genreList,
    state: {
      type,
      sort,
      page,
      genres,
      query: pageQuery({
        type: types.length > 1 && (explicit || type !== types[0]) ? type : undefined,
        sort,
        genres,
      }),
    },
  };
}

/** Artwork for the social card: the first title of the page's own list. Never throws. */
export async function entityImage(config: EntityConfig, params: RawSearchParams): Promise<CatalogImageSource | null> {
  try {
    const { state } = await resolveEntity(config, params);
    const data = await config.load(state.type, { sort: state.sort, page: state.page, genres: state.genres });
    return pickImage(data.results);
  } catch {
    return null;
  }
}

export interface EntityCatalogProps {
  config: EntityConfig;
  params: RawSearchParams;
  /** The page header (logo, h1...). Receives the resolved state for links. */
  header: (state: EntityState) => ReactNode;
  /** Full-bleed rail between the header and the controls. Only shown on page 1 without genres. */
  rail?: ReactNode;
  /** Name of the list for the current type, for example "Movies on Netflix". */
  headingFor: (type: CatalogType) => string;
  /** Copy for the empty state. */
  emptyFor: (state: EntityState) => EmptyCopy;
}

export async function EntityCatalog({ config, params, header, rail, headingFor, emptyFor }: EntityCatalogProps) {
  const { state, genreList } = await resolveEntity(config, params);
  const withTabs = config.types.length > 1;
  const showRail = rail != null && state.page === 1 && state.genres.length === 0;
  const key = `${state.type}|${state.sort}|${state.genres.join(",")}|${state.page}`;
  const heading = headingFor(state.type);
  const load = () => config.load(state.type, { sort: state.sort, page: state.page, genres: state.genres });

  return (
    <>
      <div className={catalogPageTop}>{header(state)}</div>

      {showRail ? rail : null}

      <div className={catalogPageBottom}>
        <h2 className="sr-only">{heading}</h2>

        <div className={showRail ? undefined : "mt-6 md:mt-8"}>
          <CatalogControls
            type={state.type}
            withTabs={withTabs}
            basePath={config.basePath}
            query={state.query}
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
              type={state.type}
              basePath={config.basePath}
              query={state.query}
              label={heading}
              canClearFilters={state.genres.length > 0}
              priorityCount={showRail ? 0 : 1}
              empty={emptyFor(state)}
            />
          </Suspense>
        </div>
      </div>
    </>
  );
}
