import "server-only";
import { headers } from "next/headers";
import { getWatchRegions, type RegionDTO } from "./lists";

export interface ResolvedRegion extends RegionDTO {
  /** Where the code came from: the ?region= param, the visitor's country (cf-ipcountry), or the US default */
  source: "param" | "geo" | "default";
}

const US: RegionDTO = { code: "US", name: "United States" };

/**
 * Region for watch-provider data:
 * 1. `override` (the ?region=XX search param) when TMDB has providers there,
 * 2. else the Cloudflare `cf-ipcountry` request header when TMDB has providers there,
 * 3. else US.
 *
 * Reads request headers, so it opts the route into dynamic rendering. Call it
 * only on routes that are dynamic anyway (e.g. /browse/[slug], which reads
 * searchParams). On ISR pages use "US" or a fixed region instead.
 */
export async function resolveRegion(override?: string | string[] | null): Promise<ResolvedRegion> {
  const regions = await getWatchRegions().catch(() => [] as RegionDTO[]);
  const find = (code: string | null | undefined): RegionDTO | null => {
    const c = (code ?? "").trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(c)) return null;
    // If the regions list could not be loaded, accept US only.
    if (regions.length === 0) return c === "US" ? US : null;
    return regions.find((r) => r.code === c) ?? null;
  };

  const param = find(Array.isArray(override) ? override[0] : override);
  if (param) return { ...param, source: "param" };

  // Not wrapped in try/catch: Next signals "this route is dynamic" by throwing from headers().
  const geo = find((await headers()).get("cf-ipcountry"));
  if (geo) return { ...geo, source: "geo" };

  return { ...(find("US") ?? US), source: "default" };
}

/** English name of a region code ("GB" -> "United Kingdom"), falling back to the code. */
export async function getRegionName(code: string): Promise<string> {
  const c = code.toUpperCase();
  const regions = await getWatchRegions().catch(() => [] as RegionDTO[]);
  return regions.find((r) => r.code === c)?.name ?? (c === "US" ? US.name : c);
}
