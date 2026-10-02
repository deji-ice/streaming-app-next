"use client";

import { CaretRightIcon } from "@phosphor-icons/react";
import { useMemo } from "react";

import { focusRing } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { LandscapeCard } from "@/components/ds/landscape-card";
import { Rail } from "@/components/ds/rail";
import { formatEpisodeCode, formatRelativeTime } from "@/lib/format";
import {
  useLocalHistory,
  useLocalHistoryHydrated,
  type LocalHistoryEntry,
  type LocalHistoryState,
} from "@/lib/history";
import { mediaHref } from "@/lib/slug";
import { cn } from "@/lib/utils";

import { HistoryRailSkeleton } from "./skeletons";

/** Titles shown in the rail. The local store keeps up to 50, one per title, newest first. */
const MAX_ITEMS = 12;

const selectEntries = (state: LocalHistoryState) => state.entries;

interface ContinueCard {
  key: string;
  href: string;
  title: string;
  imagePath: string | null;
  /** One line only: the reserved slot height has room for the title plus a single subtitle line. */
  subtitle: string;
}

function toCard(entry: LocalHistoryEntry, now: number): ContinueCard {
  const isSeries = entry.mediaType === "tv";
  const episodeCode = isSeries ? formatEpisodeCode(entry.season, entry.episode) : null;
  const base = mediaHref(entry.mediaType, entry.tmdbId, entry.title);
  const when = formatRelativeTime(entry.watchedAt, now);
  const label = episodeCode ?? (isSeries ? "Series" : "Movie");

  return {
    key: `${entry.mediaType}-${entry.tmdbId}`,
    // A series reopens at the episode that was last played.
    href: episodeCode ? `${base}?season=${entry.season}&episode=${entry.episode}` : base,
    title: entry.title,
    imagePath: entry.backdropPath ?? entry.posterPath,
    subtitle: when ? `${label} · ${when}` : label,
  };
}

function HistoryLink() {
  return (
    <IntentLink
      href="/history"
      className={cn(
        "inline-flex min-h-11 items-center gap-1 rounded-full px-1 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-primary md:min-h-10",
        focusRing,
      )}
    >
      History
      <CaretRightIcon size={16} aria-hidden="true" />
    </IntentLink>
  );
}

/**
 * Continue watching: the viewer's local watch history as a landscape rail.
 *
 * Renders inside .history-slot. When the inline head script found history in
 * localStorage (html[data-history="1"]), CSS reserves the rail's height and a
 * matching skeleton fills it until the store hydrates, so the page below never
 * shifts. Visitors without history see nothing, before or after hydration.
 */
export function ContinueWatching() {
  const hydrated = useLocalHistoryHydrated();
  const entries = useLocalHistory(selectEntries);

  const cards = useMemo(() => {
    const now = Date.now();
    return entries.slice(0, MAX_ITEMS).map((entry) => toCard(entry, now));
  }, [entries]);

  return (
    <div className="history-slot">
      {!hydrated ? (
        <HistoryRailSkeleton />
      ) : cards.length > 0 ? (
        <Rail title="Continue watching" variant="landscape" action={<HistoryLink />}>
          {cards.map((card) => (
            <LandscapeCard
              key={card.key}
              href={card.href}
              title={card.title}
              imagePath={card.imagePath}
              subtitle={card.subtitle}
            />
          ))}
        </Rail>
      ) : null}
    </div>
  );
}
