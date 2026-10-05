import { PlayIcon } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { Suspense } from "react";

import { focusRing, hoverTitle, hoverZoom, pillBase, pillVariants } from "@/components/ds/classes";
import { IntentLink } from "@/components/ds/intent-link";
import { MetaRow } from "@/components/ds/meta-row";
import { Rail } from "@/components/ds/rail";
import { formatDate, formatRuntime } from "@/lib/format";
import { getSeason, isTmdbNotFound } from "@/lib/tmdb";
import { tmdbImage } from "@/lib/tmdb-image";
import type { EpisodeDTO, SeasonSummaryDTO } from "@/lib/tmdb/types";
import { cn } from "@/lib/utils";

import { ScrollActive } from "./scroll-active";
import { seasonLabel, todayIso } from "./series-utils";
import { EpisodesRailSkeleton } from "./skeletons";

/** Episode card width in the rail (same widths as LandscapeCard in rails). */
export const episodeCardWidth = "w-[75vw] sm:w-[280px] lg:w-80";

function NowPlaying() {
  return (
    <span className="inline-flex items-center gap-1 font-medium text-primary">
      <PlayIcon weight="fill" size={14} aria-hidden="true" />
      Now playing
    </span>
  );
}

interface EpisodeCardProps {
  episode: EpisodeDTO;
  /** ?season=&episode= link. */
  href: string;
  current: boolean;
  /** Not aired yet: shown as "Airs {date}" and not a link. */
  upcoming: boolean;
}

/**
 * One episode: 16:9 still, "E{n}" and the title, a meta line and a two-line
 * overview. The title link is stretched over the whole card (one link per
 * card). The current episode gets a coral frame and "Now playing".
 */
function EpisodeCard({ episode, href, current, upcoming }: EpisodeCardProps) {
  const still = tmdbImage(episode.stillPath);
  const airDate = formatDate(episode.airDate);

  return (
    <div data-current={current ? "true" : undefined} className={cn("group relative", episodeCardWidth)}>
      <div
        className={cn(
          "relative aspect-video overflow-hidden rounded-media bg-muted",
          current && "ring-2 ring-primary ring-offset-2 ring-offset-background",
          upcoming && "opacity-60",
        )}
      >
        {still ? (
          <Image
            src={still}
            alt=""
            fill
            sizes="(min-width:1024px) 320px, (min-width:640px) 280px, 75vw"
            className={cn("object-cover", !upcoming && hoverZoom)}
          />
        ) : (
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center text-sm font-medium tabular-nums text-subtle-foreground"
          >
            E{episode.episodeNumber}
          </span>
        )}
      </div>

      <h3 className="mt-2 line-clamp-2 text-sm font-medium leading-5 text-foreground">
        <span className="tabular-nums text-subtle-foreground">
          <span aria-hidden="true">E{episode.episodeNumber} </span>
          <span className="sr-only">Episode {episode.episodeNumber}: </span>
        </span>
        {upcoming ? (
          <span className="text-muted-foreground">{episode.name}</span>
        ) : (
          <IntentLink
            href={href}
            aria-current={current ? "true" : undefined}
            className={cn(
              "after:absolute after:inset-0 after:rounded-media focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring focus-visible:after:ring-offset-2 focus-visible:after:ring-offset-background",
              hoverTitle,
            )}
          >
            {episode.name}
          </IntentLink>
        )}
      </h3>
      <MetaRow
        className="mt-0.5 text-[13px] leading-5"
        items={[
          current ? <NowPlaying key="now-playing" /> : null,
          formatRuntime(episode.runtime),
          upcoming ? (airDate ? `Airs ${airDate}` : null) : airDate,
        ]}
      />
      {episode.overview ? (
        <p className="mt-1 line-clamp-2 text-[13px] leading-5 text-muted-foreground">{episode.overview}</p>
      ) : null}
    </div>
  );
}

/** Season pill links (?season=N, replace, episode resets to 1). */
function SeasonPills({
  seasons,
  currentSeason,
  basePath,
}: {
  seasons: readonly SeasonSummaryDTO[];
  currentSeason: number;
  basePath: string;
}) {
  if (seasons.length < 2) return null;
  return (
    <nav aria-label="Seasons" className="mt-2">
      <ScrollActive className="no-scrollbar relative overflow-x-auto px-gutter scroll-px-gutter">
        <ul className="flex w-max gap-2 py-1">
          {seasons.map((season) => {
            const active = season.seasonNumber === currentSeason;
            return (
              <li key={season.seasonNumber}>
                <IntentLink
                  href={`${basePath}?season=${season.seasonNumber}`}
                  replace
                  scroll={false}
                  aria-current={active ? "true" : undefined}
                  className={cn(pillBase, active ? pillVariants.primary : pillVariants.secondary, focusRing)}
                >
                  {seasonLabel(season)}
                </IntentLink>
              </li>
            );
          })}
        </ul>
      </ScrollActive>
    </nav>
  );
}

export interface EpisodesRailProps {
  tvId: number;
  /** Canonical series path without a query string, for example /series/the-last-of-us-100088. */
  basePath: string;
  /** TvDTO.ended: lets a finished show's season be cached for a week. */
  ended: boolean;
  /** Seasons that have episodes (see listedSeasons). */
  seasons: readonly SeasonSummaryDTO[];
  currentSeason: number;
  currentEpisode: number;
}

/** Loads the season and renders the rail. A failed load becomes a short inline message. */
async function EpisodesRailContent({ tvId, basePath, ended, seasons, currentSeason, currentEpisode }: EpisodesRailProps) {
  let episodes: EpisodeDTO[] = [];
  let failed = false;
  try {
    episodes = (await getSeason(tvId, currentSeason, { ended })).episodes;
  } catch (error) {
    if (!isTmdbNotFound(error)) {
      console.error(`[series] Could not load season ${currentSeason} of series ${tvId}`, error);
      failed = true;
    }
  }

  const season = seasons.find((s) => s.seasonNumber === currentSeason);
  const summary = season ? (
    <p className="hidden text-[13px] tabular-nums text-subtle-foreground sm:block">
      {seasonLabel(season)}
      {episodes.length > 0 ? `, ${episodes.length} episodes` : ""}
    </p>
  ) : null;
  const pills = <SeasonPills seasons={seasons} currentSeason={currentSeason} basePath={basePath} />;

  if (episodes.length === 0) {
    return (
      <section aria-labelledby="episodes-heading" className="py-5 md:py-7">
        <div className="flex min-h-11 items-center px-gutter">
          <h2 id="episodes-heading" className="type-section text-foreground">
            Episodes
          </h2>
        </div>
        {pills}
        <p className="mt-3 px-gutter text-sm leading-6 text-muted-foreground">
          {failed
            ? "The episode list did not load. Reload the page to try again."
            : "There are no episodes listed for this season yet."}
        </p>
      </section>
    );
  }

  const today = todayIso();
  return (
    <Rail
      title="Episodes"
      headingId="episodes-heading"
      variant="landscape"
      action={summary}
      beforeList={pills}
      initialSelector='[data-current="true"]'
      // Sits right under the player and scrolls itself to the current episode.
      deferRender={false}
    >
      {episodes.map((episode) => (
        <EpisodeCard
          key={episode.id}
          episode={episode}
          href={`${basePath}?season=${currentSeason}&episode=${episode.episodeNumber}`}
          current={episode.episodeNumber === currentEpisode}
          upcoming={episode.airDate !== null && episode.airDate > today}
        />
      ))}
    </Rail>
  );
}

/**
 * Episodes of the current season as a full-bleed rail, placed directly under
 * the player: season pills above, episode cards below, starting at the current
 * episode. The cards stream in behind a skeleton of the same size.
 */
export function EpisodesRail(props: EpisodesRailProps) {
  return (
    <Suspense key={props.currentSeason} fallback={<EpisodesRailSkeleton withPills={props.seasons.length > 1} />}>
      <EpisodesRailContent {...props} />
    </Suspense>
  );
}
