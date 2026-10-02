import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { Suspense } from "react";

import { FavoriteToggle, ShareButton, WatchlistToggle, type SaveTarget } from "@/components/details/actions";
import { CastRail } from "@/components/details/cast-rail";
import { countryNames, languageName } from "@/components/details/detail-format";
import { factRow, FactsList, PeopleList } from "@/components/details/facts-list";
import { FunFacts } from "@/components/details/fun-facts";
import { blockGap, pageWrapper } from "@/components/details/layout-classes";
import { LogoChipList } from "@/components/details/logo-chip-list";
import { MetaLink, RatingPill } from "@/components/details/meta-items";
import { buildDetailMetadata } from "@/components/details/metadata";
import { OverviewSection } from "@/components/details/overview-section";
import { PlayerBand } from "@/components/details/player-band";
import { RecommendationsRail } from "@/components/details/recommendations-rail";
import { FunFactsSkeleton } from "@/components/details/skeletons";
import { hasWatchOptions, StreamingOn } from "@/components/details/streaming-on";
import { TitleHeader } from "@/components/details/title-header";
import { MetaRow } from "@/components/ds/meta-row";
import { Rating } from "@/components/ds/rating";
import { TrailerButton, VideoRail } from "@/components/ds/trailer";
import VideoPlayer from "@/components/media/VideoPlayer";
import { formatDate, formatMoney, formatRuntime } from "@/lib/format";
import { RecordView } from "@/lib/history/record-view";
import { companyHref, mediaHref, parseIdFromSlug } from "@/lib/slug";
import { getMovie, isTmdbNotFound, type MovieDTO } from "@/lib/tmdb";
import { selectWatchProviders } from "@/lib/tmdb/providers";
import { cn } from "@/lib/utils";

// Detail data changes slowly: regenerate at most every 12 hours. No ids are known at build
// time, so each movie page is built on its first visit and then served from the cache.
export const revalidate = 43200;

export async function generateStaticParams() {
  return [];
}

type PageProps = { params: Promise<{ slug: string }> };

/**
 * Loads the movie for a route slug. getMovie is request-cached, so generateMetadata and the
 * page share one TMDB call. Only a real TMDB "not found" becomes a 404; other errors reach
 * app/error.tsx.
 */
async function loadMovie(slug: string): Promise<MovieDTO> {
  const id = parseIdFromSlug(slug);
  if (id === null) notFound();
  try {
    return await getMovie(id);
  } catch (error) {
    if (isTmdbNotFound(error)) notFound();
    throw error;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const movie = await loadMovie(slug);
  return buildDetailMetadata({
    kind: "movie",
    title: movie.title,
    year: movie.year,
    overview: movie.overview,
    canonicalPath: mediaHref("movie", movie.id, movie.title),
    backdropPath: movie.backdropPath,
    posterPath: movie.posterPath,
  });
}

export default async function MoviePage({ params }: PageProps) {
  const { slug } = await params;
  const movie = await loadMovie(slug);

  // One URL per movie: send legacy and mistyped slugs to the normalized one.
  const canonicalPath = mediaHref("movie", movie.id, movie.title);
  if (`/movie/${slug}` !== canonicalPath) permanentRedirect(canonicalPath);

  const providers = selectWatchProviders(movie.watchProviders, "US");
  const saveTarget: SaveTarget = {
    tmdbId: movie.id,
    mediaType: "movie",
    title: movie.title,
    posterPath: movie.posterPath,
    backdropPath: movie.backdropPath,
    voteAverage: movie.rating,
    releaseDate: movie.releaseDate,
  };
  const releaseDate = formatDate(movie.releaseDate, "long");
  const language = languageName(movie.originalLanguage, movie.spokenLanguages);

  return (
    <>
      <PlayerBand>
        <VideoPlayer
          tmdbId={movie.id}
          type="movie"
          posterPath={movie.backdropPath ?? movie.posterPath ?? ""}
          title={movie.title}
        />
      </PlayerBand>

      <div className={cn(pageWrapper, "flex flex-col pt-6 md:pt-10", blockGap)}>
        <TitleHeader
          title={movie.title}
          posterPath={movie.posterPath}
          logo={movie.logo}
          tagline={movie.tagline}
          meta={
            <MetaRow
              items={[
                movie.year,
                movie.certification ? <RatingPill key="certification">{movie.certification}</RatingPill> : null,
                formatRuntime(movie.runtime),
                ...movie.genres.map((genre) => (
                  <MetaLink key={genre.id} href={`/movie?genres=${genre.id}`}>
                    {genre.name}
                  </MetaLink>
                )),
              ]}
            />
          }
          rating={<Rating value={movie.rating} votes={movie.voteCount} showSource size="md" />}
          actions={
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              {movie.trailer ? <TrailerButton videos={movie.videos} title={movie.title} /> : null}
              <WatchlistToggle target={saveTarget} />
              <FavoriteToggle target={saveTarget} />
              <ShareButton title={movie.title} />
            </div>
          }
        />

        <OverviewSection
          overview={movie.overview}
          funFacts={
            <Suspense fallback={<FunFactsSkeleton />}>
              <FunFacts type="movie" wikidataId={movie.externalIds.wikidataId} tmdb={movie} />
            </Suspense>
          }
          credits={
            hasWatchOptions(providers) || movie.productionCompanies.length > 0 ? (
              <>
                <StreamingOn providers={providers} regionLabel="In the United States" />
                <LogoChipList
                  title="Production"
                  headingId="production-heading"
                  items={movie.productionCompanies.map((company) => ({
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
              factRow(
                movie.directors.length > 1 ? "Directors" : "Director",
                movie.directors.length > 0 ? <PeopleList people={movie.directors} /> : null,
              ),
              factRow(
                movie.writers.length > 1 ? "Writers" : "Writer",
                movie.writers.length > 0 ? <PeopleList people={movie.writers} showJob /> : null,
              ),
              factRow("Original title", movie.originalTitle !== movie.title ? movie.originalTitle : null),
              factRow("Status", movie.status),
              factRow("Release date", releaseDate),
              factRow("Original language", language),
              factRow("Budget", formatMoney(movie.budget)),
              factRow("Revenue", formatMoney(movie.revenue)),
              factRow("Countries", countryNames(movie.productionCountries)),
              factRow("Collection", movie.collection?.name),
            ]}
          />
        </OverviewSection>
      </div>

      <div className="mt-6 md:mt-8">
        <CastRail title={movie.title} cast={movie.cast} crew={movie.crew} />
        <VideoRail videos={movie.videos} title={movie.title} />
        <RecommendationsRail items={movie.recommendations} />
      </div>

      <RecordView
        tmdbId={movie.id}
        mediaType="movie"
        title={movie.title}
        posterPath={movie.posterPath}
        backdropPath={movie.backdropPath}
      />
    </>
  );
}
