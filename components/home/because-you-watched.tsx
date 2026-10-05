"use client";

import { queryOptions, useQueries } from "@tanstack/react-query";
import { useMemo } from "react";

import { PosterCard } from "@/components/ds/poster-card";
import { Rail } from "@/components/ds/rail";
import { RailSkeleton } from "@/components/ds/skeletons";
import { useLocalHistory, useLocalHistoryHydrated, type LocalHistoryState } from "@/lib/history";
import { mediaHref } from "@/lib/slug";

/** One rail per recent title, at most this many. */
const MAX_RAILS = 2;
const MAX_CARDS = 20;
/** History keys sent as the exclude list (the local store holds at most 50). */
const MAX_EXCLUDE = 100;
const STALE_TIME = 10 * 60_000;

const selectEntries = (state: LocalHistoryState) => state.entries;

interface Seed {
  /** "movie:123" or "tv:456", the key format /api/recommendations expects. */
  key: string;
  title: string;
}

/** The fields of a /api/recommendations row (a CardDTO) that these rails use. */
interface RecommendedTitle {
  id: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  year: number | string | null;
  rating: number | null;
}

async function fetchRecommendedTitles(
  seed: string,
  exclude: readonly string[],
  signal: AbortSignal,
): Promise<RecommendedTitle[]> {
  const params = new URLSearchParams({ seeds: seed });
  if (exclude.length > 0) params.set("exclude", exclude.join(","));

  const response = await fetch(`/api/recommendations?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(`Recommendations request failed (${response.status})`);
  const body = (await response.json()) as { results?: RecommendedTitle[] };
  return Array.isArray(body.results) ? body.results : [];
}

/** One request per seed. `exclude` is sorted by the caller so equal histories share cache entries. */
const recommendationsFor = (seed: string, exclude: readonly string[]) =>
  queryOptions({
    queryKey: ["home", "because-you-watched", seed, exclude.join(",")] as const,
    queryFn: ({ signal }) => fetchRecommendedTitles(seed, exclude, signal),
    staleTime: STALE_TIME,
  });

/**
 * "Because you watched {title}": up to two rails, one per most recent distinct
 * title in the local watch history. Each rail asks /api/recommendations for
 * that one title and leaves out everything the viewer already has in their
 * history. The section stays empty when there is no history, when a request
 * fails or when TMDB has nothing to recommend, and shows skeletons only while
 * requests for existing seeds are in flight.
 */
export function BecauseYouWatched() {
  const hydrated = useLocalHistoryHydrated();
  const entries = useLocalHistory(selectEntries);

  const { seeds, exclude } = useMemo((): { seeds: Seed[]; exclude: string[] } => {
    if (!hydrated) return { seeds: [], exclude: [] };
    return {
      seeds: entries
        .slice(0, MAX_RAILS)
        .map((entry) => ({ key: `${entry.mediaType}:${entry.tmdbId}`, title: entry.title })),
      exclude: entries
        .slice(0, MAX_EXCLUDE)
        .map((entry) => `${entry.mediaType}:${entry.tmdbId}`)
        .sort(),
    };
  }, [entries, hydrated]);

  const results = useQueries({ queries: seeds.map((seed) => recommendationsFor(seed.key, exclude)) });

  if (seeds.length === 0) return null;

  // Wait for every request before drawing, so the second rail can drop titles the first one shows.
  if (results.some((result) => result.isPending && result.fetchStatus === "fetching")) {
    return (
      <>
        {seeds.map((seed) => (
          <RailSkeleton key={seed.key} variant="poster" titleWidth="w-64 md:w-96" />
        ))}
      </>
    );
  }

  const shown = new Set<string>();

  return (
    <>
      {seeds.map((seed, index) => {
        const cards: RecommendedTitle[] = [];
        for (const item of results[index]?.data ?? []) {
          const key = `${item.mediaType}:${item.id}`;
          if (shown.has(key)) continue;
          shown.add(key);
          cards.push(item);
          if (cards.length >= MAX_CARDS) break;
        }
        if (cards.length === 0) return null;

        return (
          <Rail key={seed.key} title={`Because you watched ${seed.title}`} variant="poster">
            {cards.map((item) => (
              <PosterCard
                key={`${item.mediaType}-${item.id}`}
                href={mediaHref(item.mediaType, item.id, item.title)}
                title={item.title}
                posterPath={item.posterPath}
                year={item.year}
                rating={item.rating}
              />
            ))}
          </Rail>
        );
      })}
    </>
  );
}
