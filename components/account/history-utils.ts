import { formatEpisodeCode } from "@/lib/format";
import { mediaHref } from "@/lib/slug";
import type { WatchHistoryItem } from "@/lib/user-data";

/**
 * Link for a history entry. Series with a known episode resume there
 * (?season=&episode=, the params the series page reads); everything else goes
 * to the plain detail page. TV always links to /series (never /tv).
 */
export function historyHref(item: Pick<WatchHistoryItem, "media_type" | "tmdb_id" | "title" | "season_number" | "episode_number">): string {
  const base = mediaHref(item.media_type, item.tmdb_id, item.title);
  if (item.media_type === "tv" && item.season_number != null && item.episode_number != null) {
    return `${base}?season=${item.season_number}&episode=${item.episode_number}`;
  }
  return base;
}

/** "S2 E5" for a series with a known episode, otherwise "Series" or "Movie". */
export function historySubtitle(item: Pick<WatchHistoryItem, "media_type" | "season_number" | "episode_number">): string {
  if (item.media_type !== "tv") return "Movie";
  return formatEpisodeCode(item.season_number, item.episode_number) ?? "Series";
}

/** "Movie" or "Series", for saved titles. */
export const typeLabel = (mediaType: "movie" | "tv" | string): "Movie" | "Series" =>
  mediaType === "movie" ? "Movie" : "Series";
