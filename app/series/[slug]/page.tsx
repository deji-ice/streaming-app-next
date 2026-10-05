import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";

import { FavoriteToggle, ShareButton, WatchlistToggle, type SaveTarget } from "@/components/details/actions";
import { CastRail } from "@/components/details/cast-rail";
import { countryNames, languageName, plural } from "@/components/details/detail-format";
import { EpisodesRail } from "@/components/details/episodes";
import { factRow, FactsList, PeopleList } from "@/components/details/facts-list";
import { FunFacts } from "@/components/details/fun-facts";
import { blockGap, pageWrapper } from "@/components/details/layout-classes";
import { LogoChipList } from "@/components/details/logo-chip-list";
import { MetaLink, RatingPill } from "@/components/details/meta-items";
import { buildDetailMetadata } from "@/components/details/metadata";
import { OverviewSection } from "@/components/details/overview-section";
import { PlayerBand } from "@/components/details/player-band";
import { RecommendationsRail } from "@/components/details/recommendations-rail";
import {
  defaultSeasonNumber,
  listedSeasons,
  nextEpisodeLabel,
  parseCountParam,
  runLabel,
  todayIso,
  toQueryString,
} from "@/components/details/series-utils";
import { FunFactsSkeleton } from "@/components/details/skeletons";
import { hasWatchOptions, StreamingOn } from "@/components/details/streaming-on";
import { TitleHeader } from "@/components/details/title-header";
import { MetaRow } from "@/components/ds/meta-row";
import { Rating } from "@/components/ds/rating";
import { TrailerButton, VideoRail } from "@/components/ds/trailer";
import VideoPlayer from "@/components/media/VideoPlayer";
import { formatDate, formatRuntime } from "@/lib/format";
import { RecordView } from "@/lib/history/record-view";
import { companyHref, mediaHref, networkHref, parseIdFromSlug } from "@/lib/slug";
import { getTv, isTmdbNotFound, type TvDTO } from "@/lib/tmdb";
import { selectWatchProviders } from "@/lib/tmdb/providers";
import { cn } from "@/lib/utils";

// This page reads ?season= and ?episode=, so it renders per request. The TMDB data behind
// it (series, season) is cached by the loaders in lib/tmdb.

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/**
 * Loads the series for a route slug. getTv is request-cached, so generateMetadata and the
 * page share one TMDB call. Only a real TMDB "not found" becomes a 404; other errors reach
 * app/error.tsx.
 */
async function loadTv(slug: string): Promise<TvDTO> {
  const id = parseIdFromSlug(slug);
  if (id === null) notFound();
  try {
    return await getTv(id);
  } catch (error) {
    if (isTmdbNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: Pick<PageProps, "params">): Promise<Metadata> {
  const { slug } = await params;
  const tv = await loadTv(slug);
  return buildDetailMetadata({
    kind: "tv",
    title: tv.title,
    year: tv.year,
    overview: tv.overview,
    canonicalPath: mediaHref("tv", tv.id, tv.title),
    backdropPath: tv.backdropPath,
    posterPath: tv.posterPath,
  });
}

export default async function SeriesPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;
  const tv = await loadTv(slug);

  // One URL per series: send legacy and mistyped slugs to the normalized one, keeping the query.
  const basePath = mediaHref("tv", tv.id, tv.title);
  if (`/series/${slug}` !== basePath) permanentRedirect(`${basePath}${toQueryString(query)}`);

  // Season and episode come from the URL. Without a valid ?season= the latest aired season is
  // shown; the episode defaults to 1.
  const seasons = listedSeasons(tv.seasons);
  const requestedSeason = parseCountParam(query.season, { allowZero: true });
  const requestedEpisode = parseCountParam(query.episode);
  const currentSeason =
    requestedSeason !== null && seasons.some((season) => season.seasonNumber === requestedSeason)
      ? requestedSeason
      : defaultSeasonNumber(tv, todayIso());
  const currentEpisode = requestedEpisode ?? 1;
  // Only a position the URL names is history; otherwise the stored episode is kept.
  const positionFromUrl = requestedSeason !== null || requestedEpisode !== null;
  const seasonLength = seasons.find((season) => season.seasonNumber === currentSeason)?.episodeCount;

  const providers = selectWatchProviders(tv.watchProviders, "US");
  const saveTarget: SaveTarget = {
    tmdbId: tv.id,
    mediaType: "tv",
    title: tv.title,
    posterPath: tv.posterPath,
    backdropPath: tv.backdropPath,
    voteAverage: tv.rating,
    releaseDate: tv.firstAirDate,
  };
  const episodeRuntime = formatRuntime(tv.episodeRuntime);
  const nextEpisode = nextEpisodeLabel(tv.nextEpisodeToAir);
  const language = languageName(tv.originalLanguage, tv.spokenLanguages);
  const lastAired = tv.lastAirDate && tv.lastAirDate !== tv.firstAirDate ? formatDate(tv.lastAirDate, "long") : null;

  return (
    <>
      <PlayerBand>
        <VideoPlayer
          // key={`${currentSeason}-${currentEpisode}`}
          tmdbId={tv.id}
          type="series"
          posterPath={tv.backdropPath ?? tv.posterPath ?? ""}
          title={tv.title}
          episode={{ season: currentSeason, number: currentEpisode }}
          seasonLength={seasonLength || undefined}
        />
      </PlayerBand>

      {/* Episodes sit directly under the player: picking an episode is the main action here. */}
      <EpisodesRail
        tvId={tv.id}
        basePath={basePath}
        ended={tv.ended}
        seasons={seasons}
        currentSeason={currentSeason}
        currentEpisode={currentEpisode}
      />

      <div className={cn(pageWrapper, "flex flex-col pt-2 md:pt-4", blockGap)}>
        <TitleHeader
          title={tv.title}
          posterPath={tv.posterPath}
          logo={tv.logo}
          tagline={tv.tagline}
          meta={
            <MetaRow
              items={[
                runLabel(tv),
                tv.contentRating ? <RatingPill key="content-rating">{tv.contentRating}</RatingPill> : null,
                tv.numberOfSeasons > 0 ? plural(tv.numberOfSeasons, "season") : null,
                episodeRuntime ? `${episodeRuntime} per episode` : null,
                ...tv.genres.map((genre) => (
                  <MetaLink key={genre.id} href={`/series?genres=${genre.id}`}>
                    {genre.name}
                  </MetaLink>
                )),
              ]}
            />
          }
          rating={<Rating value={tv.rating} votes={tv.voteCount} showSource size="md" />}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {tv.trailer ? <TrailerButton videos={tv.videos} title={tv.title} /> : null}
              <WatchlistToggle target={saveTarget} />
              <FavoriteToggle target={saveTarget} />
              <ShareButton title={tv.title} />
            </div>
          }
        />

        <OverviewSection
          overview={tv.overview}
          funFacts={
            <Suspense fallback={<FunFactsSkeleton />}>
              <FunFacts type="tv" wikidataId={tv.externalIds.wikidataId} tmdb={tv} />
            </Suspense>
          }
          credits={
            hasWatchOptions(providers) || tv.networks.length > 0 || tv.productionCompanies.length > 0 ? (
              <>
                <StreamingOn providers={providers} regionLabel="In the United States" />
                <LogoChipList
                  title={tv.networks.length > 1 ? "Networks" : "Network"}
                  headingId="network-heading"
                  items={tv.networks.map((network) => ({
                    id: network.id,
                    name: network.name,
                    logoPath: network.logoPath,
                    href: networkHref(network.id, network.name),
                  }))}
                />
                <LogoChipList
                  title="Production"
                  headingId="production-heading"
                  items={tv.productionCompanies.map((company) => ({
                    id: company.id,
                    name: company.name,
                    logoPath: company.logoPath,
                    href: companyHref(company.id, company.name),
                  }))}
                />
              </>
            ) : null
          }
        >
          <FactsList
            rows={[
              factRow("Created by", tv.createdBy.length > 0 ? <PeopleList people={tv.createdBy} /> : null),
              factRow(
                "Status",
                tv.status || nextEpisode ? (
                  <>
                    {tv.status}
                    {nextEpisode ? (
                      <span className={cn("text-muted-foreground", tv.status && "block")}>{nextEpisode}</span>
                    ) : null}
                  </>
                ) : null,
              ),
              factRow("Seasons", tv.numberOfSeasons > 0 ? String(tv.numberOfSeasons) : null),
              factRow("Episodes", tv.numberOfEpisodes > 0 ? String(tv.numberOfEpisodes) : null),
              factRow("Original title", tv.originalTitle !== tv.title ? tv.originalTitle : null),
              factRow("First aired", formatDate(tv.firstAirDate, "long")),
              factRow("Last aired", lastAired),
              factRow("Original language", language),
              factRow("Countries", countryNames(tv.productionCountries) ?? (tv.originCountry.join(", ") || null)),
            ]}
          />
        </OverviewSection>
      </div>

      <div className="mt-6 md:mt-8">
        <CastRail title={tv.title} cast={tv.cast} crew={tv.crew} />
        <VideoRail videos={tv.videos} title={tv.title} />
        <RecommendationsRail items={tv.recommendations} />
      </div>

      <RecordView
        tmdbId={tv.id}
        mediaType="tv"
        title={tv.title}
        posterPath={tv.posterPath}
        backdropPath={tv.backdropPath}
        season={positionFromUrl ? currentSeason : undefined}
        episode={positionFromUrl ? currentEpisode : undefined}
      />
    </>
  );
}
