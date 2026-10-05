/**
 * Curated streaming services, networks and studios for /browse.
 *
 * Client-safe: plain data and pure helpers, no TMDB client and no secrets.
 * Every id and logo path below was checked live on 2026-10-01 against
 * /watch/providers/movie?watch_region=US, /watch/providers/tv?watch_region=US,
 * /network/{id} and /company/{id}.
 *
 * Provider data is JustWatch data via TMDB: every surface that shows it must
 * credit JustWatch.
 */
import type { ProviderDTO, WatchProvidersDTO, WatchProvidersIndex } from "./types";

export interface CuratedProvider {
  slug: string;
  name: string;
  /** Primary TMDB watch-provider id (its logo is logoPath). */
  providerId: number;
  /** Every TMDB provider id that counts as this service (tiers), OR-ed in discover. */
  providerIds: number[];
  /** TMDB network id(s) for the service's originals (series via with_networks). */
  networkIds: number[];
  logoPath: string;
}

export interface CuratedNetwork {
  slug: string;
  name: string;
  networkId: number;
  logoPath: string;
  originCountry: string | null;
}

export interface CuratedStudio {
  slug: string;
  name: string;
  companyId: number;
  logoPath: string;
  originCountry: string | null;
}

/** US display order (TMDB display_priorities for US, then name). */
export const CURATED_PROVIDERS: readonly CuratedProvider[] = [
  { slug: "netflix", name: "Netflix", providerId: 8, providerIds: [8], networkIds: [213], logoPath: "/rK1KljqmbvO9HQa1PBFLILWah72.png" },
  // TMDB lists the service as "HBO Max" (provider 1899); its originals span the "HBO Max" (3186) and "Max" (6783) networks.
  { slug: "hbo-max", name: "HBO Max", providerId: 1899, providerIds: [1899], networkIds: [3186, 6783], logoPath: "/skypuy7SXuugIQeYg0IglmzoKaS.png" },
  { slug: "disney-plus", name: "Disney Plus", providerId: 337, providerIds: [337], networkIds: [2739], logoPath: "/5eZ872CghnHFLB1j8grszbrx0dx.png" },
  { slug: "prime-video", name: "Amazon Prime Video", providerId: 9, providerIds: [9], networkIds: [1024], logoPath: "/gMZdpavHmxFNnLpMHwVxfqeux2g.png" },
  // Renamed from "Apple TV+" to "Apple TV"; TMDB uses the new name for provider 350 and network 2552.
  { slug: "apple-tv", name: "Apple TV", providerId: 350, providerIds: [350], networkIds: [2552], logoPath: "/9icYBfYFcwgCbky5VdGUIKJ4C5i.png" },
  { slug: "hulu", name: "Hulu", providerId: 15, providerIds: [15], networkIds: [453], logoPath: "/44uAnmSqvA4yBOdbPWN8YgQHjWm.png" },
  // The old single "Paramount Plus" id (531) is gone in the US; the service is now two tiers.
  { slug: "paramount-plus", name: "Paramount Plus", providerId: 2303, providerIds: [2303, 2616], networkIds: [4330], logoPath: "/4N4BMd0Mm0kHAmF7RZgL5lW3cwc.png" },
  { slug: "peacock", name: "Peacock", providerId: 386, providerIds: [386, 387], networkIds: [3353], logoPath: "/a1UIdq5BrkcAxnxcUhFsNbXnxeu.png" },
];

export const CURATED_NETWORKS: readonly CuratedNetwork[] = [
  { slug: "hbo", name: "HBO", networkId: 49, logoPath: "/tuomPhY2UtuPTqqFnKMVHvSb724.png", originCountry: "US" },
  { slug: "netflix", name: "Netflix", networkId: 213, logoPath: "/wwemzKWzjKYJFfCeiB57q3r4Bcm.png", originCountry: null },
  { slug: "amc", name: "AMC", networkId: 174, logoPath: "/pmvRmATOCaDykE6JrVoeYxlFHw3.png", originCountry: "US" },
  { slug: "fx", name: "FX", networkId: 88, logoPath: "/aexGjtcs42DgRtZh7zOxayiry4J.png", originCountry: "US" },
  { slug: "apple-tv", name: "Apple TV", networkId: 2552, logoPath: "/bngHRFi794mnMq34gfVcm9nDxN1.png", originCountry: null },
  { slug: "bbc-one", name: "BBC One", networkId: 4, logoPath: "/uJjcCg3O4DMEjM0xtno9OWFciRP.png", originCountry: "GB" },
  { slug: "showtime", name: "Showtime", networkId: 67, logoPath: "/Allse9kbjiP6ExaQrnSpIhkurEi.png", originCountry: "US" },
  { slug: "prime-video", name: "Prime Video", networkId: 1024, logoPath: "/w7HfLNm9CWwRmAMU58udl2L7We7.png", originCountry: null },
  { slug: "disney-plus", name: "Disney+", networkId: 2739, logoPath: "/1edZOYAfoyZyZ3rklNSiUpXX30Q.png", originCountry: null },
  { slug: "hulu", name: "Hulu", networkId: 453, logoPath: "/pqUTCleNUiTLAVlelGxUgWn1ELh.png", originCountry: "US" },
];

export const CURATED_STUDIOS: readonly CuratedStudio[] = [
  { slug: "a24", name: "A24", companyId: 41077, logoPath: "/1ZXsGaFPgrgS6ZZGS37AqD5uU12.png", originCountry: "US" },
  { slug: "pixar", name: "Pixar", companyId: 3, logoPath: "/1TjvGVDMYsj6JBxOAkUHpPEwLf7.png", originCountry: "US" },
  { slug: "marvel-studios", name: "Marvel Studios", companyId: 420, logoPath: "/hUzeosd33nzE5MCNsZxCGEKTXaQ.png", originCountry: "US" },
  { slug: "warner-bros-pictures", name: "Warner Bros. Pictures", companyId: 174, logoPath: "/zhD3hhtKB5qyv7ZeL4uLpNxgMVU.png", originCountry: "US" },
  { slug: "studio-ghibli", name: "Studio Ghibli", companyId: 10342, logoPath: "/uFuxPEZRUcBTEiYIxjHJq62Vr77.png", originCountry: "JP" },
  { slug: "blumhouse", name: "Blumhouse Productions", companyId: 3172, logoPath: "/rzKluDcRkIwHZK2pHsiT667A2Kw.png", originCountry: "US" },
  { slug: "lucasfilm", name: "Lucasfilm Ltd.", companyId: 1, logoPath: "/tlVSws0RvvtPBwViUyOFAO0vcQS.png", originCountry: "US" },
  { slug: "neon", name: "NEON", companyId: 90733, logoPath: "/3K9wCZTyDgop3ITK1rDi6T2PckE.png", originCountry: "US" },
  { slug: "legendary-pictures", name: "Legendary Pictures", companyId: 923, logoPath: "/5UQsZrfbfG2dYJbx8DxfoTr2Bvu.png", originCountry: "US" },
];

export const getCuratedProvider = (slug: string): CuratedProvider | null =>
  CURATED_PROVIDERS.find((p) => p.slug === slug.toLowerCase()) ?? null;

export const getCuratedNetwork = (slug: string): CuratedNetwork | null =>
  CURATED_NETWORKS.find((n) => n.slug === slug.toLowerCase()) ?? null;

export const getCuratedStudio = (slug: string): CuratedStudio | null =>
  CURATED_STUDIOS.find((s) => s.slug === slug.toLowerCase()) ?? null;

/** Curated /browse slug for a TMDB watch-provider id (any tier), else null. */
export function curatedSlugForProviderId(providerId: number): string | null {
  for (const p of CURATED_PROVIDERS) if (p.providerIds.includes(providerId)) return p.slug;
  return null;
}

/**
 * Resolve a /network/[slug] or /company/[slug] param: a curated slug ("hbo",
 * "a24") or any "{name}-{id}" / "{id}" slug. Returns the TMDB id or null.
 */
export function resolveNetworkSlug(slug: string): { id: number; curated: CuratedNetwork | null } | null {
  const curated = getCuratedNetwork(slug);
  if (curated) return { id: curated.networkId, curated };
  const id = trailingId(slug);
  if (id === null) return null;
  return { id, curated: CURATED_NETWORKS.find((n) => n.networkId === id) ?? null };
}

export function resolveCompanySlug(slug: string): { id: number; curated: CuratedStudio | null } | null {
  const curated = getCuratedStudio(slug);
  if (curated) return { id: curated.companyId, curated };
  const id = trailingId(slug);
  if (id === null) return null;
  return { id, curated: CURATED_STUDIOS.find((s) => s.companyId === id) ?? null };
}

function trailingId(slug: string): number | null {
  const last = slug.split("-").pop() ?? "";
  if (!/^\d+$/.test(last)) return null;
  const id = Number(last);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

/**
 * One region's providers from the compact index stored on MovieDTO/TvDTO.
 * Returns null when TMDB has no data for that title in that region.
 */
export function selectWatchProviders(
  index: WatchProvidersIndex | null | undefined,
  region: string,
): WatchProvidersDTO | null {
  const code = region.toUpperCase();
  const entry = index?.regions[code];
  if (!index || !entry) return null;
  const expand = (ids: number[]): ProviderDTO[] =>
    ids.flatMap((id) => {
      const p = index.providers[String(id)];
      return p ? [{ id, name: p.name, logoPath: p.logoPath, slug: curatedSlugForProviderId(id) }] : [];
    });
  return {
    region: code,
    link: entry.link,
    flatrate: expand(entry.flatrate),
    free: expand(entry.free),
    ads: expand(entry.ads),
    rent: expand(entry.rent),
    buy: expand(entry.buy),
  };
}
