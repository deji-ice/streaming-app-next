"use client";

import { SparkleIcon } from "@phosphor-icons/react";
import Link from "next/link";

import { EmptyState } from "@/components/ds/empty-state";
import { PosterCard } from "@/components/ds/poster-card";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useUser";
import { useRecommendations } from "@/hooks/useRecommendations";
import { mediaHref } from "@/lib/slug";
import { useRecommendationSeeds } from "@/lib/user-data";
import { cn } from "@/lib/utils";

import { POSTER_GRID } from "./classes";
import { typeLabel } from "./history-utils";
import { AccountPage } from "./page-shell";
import { RecommendationsSkeleton } from "./skeletons";

const TITLE = "Recommended for you";

/** "Dune, Severance, Arcane and 2 more" (up to three titles, then a count). */
function describeSeeds(titles: string[]): string {
  const shown = titles.slice(0, 3);
  const extra = titles.length - shown.length;
  const parts = extra > 0 ? [...shown, `${extra} more`] : shown;
  return new Intl.ListFormat("en-US", { style: "long", type: "conjunction" }).format(parts);
}

/**
 * Suggestions seeded from favorites, watchlist and watch history. Works
 * signed out: history on this device is enough to seed it.
 */
export function RecommendationsView() {
  const status = useAuthStatus();
  const { recommendations, isLoading, refresh } = useRecommendations();
  const { seeds } = useRecommendationSeeds();

  if (isLoading || status === "loading") return <RecommendationsSkeleton />;

  const description =
    seeds.length > 0
      ? `Based on ${describeSeeds(seeds.map((seed) => seed.title))}.`
      : "Suggestions based on what you watch, save and favorite.";

  if (recommendations.length === 0) {
    return (
      <AccountPage title={TITLE} description={description}>
        {seeds.length === 0 ? (
          <EmptyState
            className="mt-8"
            icon={<SparkleIcon weight="duotone" />}
            title="Nothing to base recommendations on yet"
            body="Watch a title, or add titles to your watchlist or favorites, and suggestions will appear here."
            action={
              <Button asChild>
                <Link href="/browse">Browse</Link>
              </Button>
            }
          />
        ) : (
          <EmptyState
            className="mt-8"
            icon={<SparkleIcon weight="duotone" />}
            title="No recommendations right now"
            body="We could not find suggestions for your recent titles. Try again in a moment."
            action={
              <Button variant="secondary" onClick={() => void refresh()}>
                Try again
              </Button>
            }
          />
        )}
      </AccountPage>
    );
  }

  return (
    <AccountPage title={TITLE} description={description}>
      <ul className={cn("mt-8", POSTER_GRID)}>
        {recommendations.map((item) => (
          <li key={`${item.media_type}-${item.id}`} className="min-w-0">
            <PosterCard
              width="fill"
              href={mediaHref(item.media_type, item.id, item.title)}
              title={item.title}
              posterPath={item.poster_path}
              year={item.release_date ?? item.first_air_date ?? null}
              rating={item.vote_average}
              subtitle={typeLabel(item.media_type)}
            />
          </li>
        ))}
      </ul>
    </AccountPage>
  );
}
