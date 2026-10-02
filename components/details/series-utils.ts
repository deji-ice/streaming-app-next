import { formatDate, formatEpisodeCode } from "@/lib/format";
import type { EpisodeRefDTO, SeasonSummaryDTO, TvDTO } from "@/lib/tmdb/types";

/** Today as YYYY-MM-DD (UTC), the same shape as TMDB air dates, so strings compare directly. */
export function todayIso(now: number = Date.now()): string {
  return new Date(now).toISOString().slice(0, 10);
}

/**
 * Reads a numeric query parameter ("?season=2"). Returns null for anything
 * that is not a plain integer of at most four digits. Season 0 (specials) is
 * accepted only when `allowZero` is set.
 */
export function parseCountParam(
  value: string | string[] | undefined,
  { allowZero = false }: { allowZero?: boolean } = {},
): number | null {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d{1,4}$/.test(raw)) return null;
  const n = Number(raw);
  return n > 0 || (allowZero && n === 0) ? n : null;
}

/** "?a=1&b=2" from Next's searchParams object (repeated keys kept), or "" when empty. */
export function toQueryString(query: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) params.append(key, item);
    } else if (value !== undefined) {
      params.append(key, value);
    }
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

/** Seasons that have episodes listed. Specials (season 0) come last. */
export function listedSeasons(seasons: readonly SeasonSummaryDTO[]): SeasonSummaryDTO[] {
  return seasons.filter((season) => season.episodeCount > 0);
}

export function seasonLabel(season: Pick<SeasonSummaryDTO, "seasonNumber">): string {
  return season.seasonNumber === 0 ? "Specials" : `Season ${season.seasonNumber}`;
}

/**
 * The season shown when the URL has no valid ?season=: the latest season with
 * aired episodes, else the first season that has episodes, else 1.
 * (Change the fallback order here if the product default should differ,
 * for example season 1 for finished shows.)
 */
export function defaultSeasonNumber(
  tv: Pick<TvDTO, "seasons" | "lastEpisodeToAir">,
  today: string,
): number {
  const listed = listedSeasons(tv.seasons);
  const lastAired = tv.lastEpisodeToAir?.seasonNumber;
  if (lastAired && lastAired > 0 && listed.some((season) => season.seasonNumber === lastAired)) {
    return lastAired;
  }
  const aired = listed.filter(
    (season) => season.seasonNumber > 0 && season.airDate !== null && season.airDate <= today,
  );
  if (aired.length > 0) return Math.max(...aired.map((season) => season.seasonNumber));
  const firstRegular = listed.find((season) => season.seasonNumber > 0);
  return firstRegular?.seasonNumber ?? listed[0]?.seasonNumber ?? 1;
}

/** "Next: S3 E4, Mar 9, 2026" (date left out when TMDB has none). Null without a next episode. */
export function nextEpisodeLabel(next: EpisodeRefDTO | null | undefined): string | null {
  if (!next) return null;
  const code = formatEpisodeCode(next.seasonNumber, next.episodeNumber);
  if (!code) return null;
  const date = formatDate(next.airDate);
  return `Next: ${code}${date ? `, ${date}` : ""}`;
}

/**
 * "2019 to 2024" for a finished run, "2019 to present" while the show is
 * returning, the bare year otherwise.
 */
export function runLabel(tv: Pick<TvDTO, "year" | "endYear" | "ended" | "status">): string | null {
  if (!tv.year) return null;
  if (tv.ended) return tv.endYear && tv.endYear !== tv.year ? `${tv.year} to ${tv.endYear}` : String(tv.year);
  return tv.status === "Returning Series" ? `${tv.year} to present` : String(tv.year);
}
