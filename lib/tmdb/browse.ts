import "server-only";
import { cached, TTL } from "./cached";
import { assertTmdbId, tmdbFetch } from "./client";
import { discoverMovies, discoverTv, normalizeSort, type DiscoverFilters } from "./lists";
import { toCompany, toNetwork } from "./normalize";
import { CURATED_NETWORKS, CURATED_STUDIOS, getCuratedProvider, type CuratedProvider } from "./providers";
import type { CardDTO, CompanyDTO, MediaType, NetworkDTO, Paged } from "./types";

export interface BrowseOptions {
  /** TMDB sort string or alias ("popularity.desc", "release_date.desc", "vote_average.desc"...); normalized per media type */
  sort?: string | null;
  page?: number;
  /** AND-ed genre ids */
  genres?: number[];
}

/* ------------------------------------------------------------------------ */
/* Streaming providers (JustWatch data: credit JustWatch where shown)        */
/* ------------------------------------------------------------------------ */

/**
 * The catalog a service's page shows, for every visitor in every country.
 *
 * TMDB can only list a provider's titles per country, and every curated service
 * is a US service, so its full flagship catalog is the US one. The visitor's own
 * country is deliberately not used: someone in Nigeria opening Hulu should see
 * Hulu's titles, not "nothing, Hulu is not available here".
 */
export const CATALOG_REGION = "US";

/**
 * Titles streaming on a provider: discover with with_watch_providers (all tiers
 * OR-ed) + watch_region (always CATALOG_REGION) + flatrate.
 * `provider` is a curated slug or a CuratedProvider. Returns null for an unknown slug.
 */
export async function discoverByProvider(
  provider: string | CuratedProvider,
  type: MediaType,
  opts: BrowseOptions = {},
): Promise<Paged<CardDTO> | null> {
  const p = typeof provider === "string" ? getCuratedProvider(provider) : provider;
  if (!p) return null;
  const filters: DiscoverFilters = {
    sort: normalizeSort(type, opts.sort),
    page: opts.page,
    genres: opts.genres,
    providers: p.providerIds,
    watchRegion: CATALOG_REGION,
    monetization: "flatrate",
  };
  return type === "movie" ? discoverMovies(filters) : discoverTv(filters);
}

/**
 * A provider's own series ("{Provider} originals" rail): discover/tv with
 * with_networks. Null when the provider has no network id. A vote floor keeps
 * obscure regional titles out of the popularity order.
 */
export async function getProviderOriginals(provider: string | CuratedProvider, opts: BrowseOptions = {}): Promise<Paged<CardDTO> | null> {
  const p = typeof provider === "string" ? getCuratedProvider(provider) : provider;
  if (!p || p.networkIds.length === 0) return null;
  const sort = normalizeSort("tv", opts.sort);
  return discoverTv({ sort, page: opts.page, genres: opts.genres, networks: p.networkIds, minVotes: sort === "popularity.desc" ? 50 : undefined });
}

/* ------------------------------------------------------------------------ */
/* Networks and companies                                                    */
/* ------------------------------------------------------------------------ */

/** Series first aired on a network (discover/tv with_networks). */
export function discoverByNetwork(networkId: number | number[], opts: BrowseOptions = {}): Promise<Paged<CardDTO>> {
  const networks = (Array.isArray(networkId) ? networkId : [networkId]).map((id) => assertTmdbId(id));
  return discoverTv({ sort: normalizeSort("tv", opts.sort), page: opts.page, genres: opts.genres, networks });
}

/** Movies or series from a production company (discover with_companies). */
export function discoverByCompany(companyId: number, type: MediaType = "movie", opts: BrowseOptions = {}): Promise<Paged<CardDTO>> {
  const companies = [assertTmdbId(companyId)];
  const filters: DiscoverFilters = { sort: normalizeSort(type, opts.sort), page: opts.page, genres: opts.genres, companies };
  return type === "movie" ? discoverMovies(filters) : discoverTv(filters);
}

const networkLoader = cached(
  "network",
  TTL.entity,
  (id: number) => [`network:${id}`],
  async (id: number): Promise<NetworkDTO> =>
    toNetwork(await tmdbFetch<{ id: number; name: string; logo_path?: string | null; origin_country?: string | null }>(`/network/${id}`, { language: null })),
);

const companyLoader = cached(
  "company",
  TTL.entity,
  (id: number) => [`company:${id}`],
  async (id: number): Promise<CompanyDTO> =>
    toCompany(await tmdbFetch<{ id: number; name: string; logo_path?: string | null; origin_country?: string | null }>(`/company/${id}`, { language: null })),
);

/** Network name and logo. Curated networks resolve without a TMDB call. */
export async function getNetwork(id: number | string): Promise<NetworkDTO> {
  const n = assertTmdbId(id);
  const curated = CURATED_NETWORKS.find((c) => c.networkId === n);
  if (curated) return { id: n, name: curated.name, logoPath: curated.logoPath, originCountry: curated.originCountry };
  return networkLoader(n);
}

/** Company name and logo. Curated studios resolve without a TMDB call. */
export async function getCompany(id: number | string): Promise<CompanyDTO> {
  const n = assertTmdbId(id);
  const curated = CURATED_STUDIOS.find((c) => c.companyId === n);
  if (curated) return { id: n, name: curated.name, logoPath: curated.logoPath, originCountry: curated.originCountry };
  return companyLoader(n);
}
