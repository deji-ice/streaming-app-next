import { Suspense } from "react";
import { notFound } from "next/navigation";
import { tmdb } from "@/lib/tmdb";
import VideoPlayer from "@/components/media/VideoPlayer";
import MediaInfo from "@/components/media/MediaInfo";
import CastList from "@/components/media/CastList";
import SeasonSelector from "@/components/media/SeasonSelector";
import EpisodeGrid from "@/components/media/EpisodeGrid";
import RecommendedMedia from "@/components/media/RecommendedMedia";

interface PageProps {
  params: Promise<{ slug: string }>; // Type params as a Promise
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params; // Await params
  const series = await getSeriesDetails(resolvedParams.slug);

  if (!series) {
    return {
      title: "Series Not Found",
      description: "The requested series could not be found.",
    };
  }

  return {
    title: `${series.name} | StreamFlix`,
    description: series.overview,
  };
}

async function getSeriesDetails(slug: string, currentSeason: number = 1) {
  const id = slug.split("-").pop();
  if (!id) return null;

  try {
    const series = await tmdb.getMediaDetails(parseInt(id), "tv");
    const seasonDetails = await tmdb.getSeasonDetails(
      parseInt(id),
      currentSeason
    );

    return {
      ...series,
      seasons: series.seasons.map((season) => ({
        ...season,
        episodes:
          season.season_number === currentSeason ? seasonDetails.episodes : [],
      })),
    };
  } catch (error) {
    console.error("Error fetching series details:", error);
    return null;
  }
}

// app/series/[slug]/page.tsx
export default async function SeriesPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const currentSeason = parseInt(resolvedSearchParams.season as string) || 1;

  // Pass currentSeason to getSeriesDetails
  const series = await getSeriesDetails(resolvedParams.slug, currentSeason);
  // Fetch recommendations in parallel
  const recommendations = await tmdb.getRecommendations(series.id, "tv");

  if (!series) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="relative aspect-video w-full">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer
            tmdbId={series.id}
            type="series"
            posterPath={series.backdrop_path || series.poster_path}
            title={series.name}
            episode={{ season: currentSeason, number: 1 }}
          />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MediaInfo
          title={series.name}
          overview={series.overview}
          releaseDate={series.first_air_date}
          rating={series.vote_average}
          posterPath={series.poster_path}
          genres={series.genres.map((g) => g.name)}
          duration={series.episode_run_time?.[0] || 0}
          cast={series.credits.cast}
          country={series.production_countries[0]?.name || "United States"}
        />

        <div className="mt-12 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-montserrat font-bold">Episodes</h2>
            <SeasonSelector
              seasons={series.seasons}
              currentSeason={currentSeason}
            />
          </div>
          <Suspense
            fallback={
              <div className="grid gap-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-32 bg-white animate-pulse rounded-lg"
                  />
                ))}
              </div>
            }
          >
            <EpisodeGrid
              episodes={
                series.seasons.find((s) => s.season_number === currentSeason)
                  ?.episodes || []
              }
              currentSeason={currentSeason}
            />
          </Suspense>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
          <CastList cast={series.credits.cast} />
        </div>

        {/* Add Recommendations */}
        <div className="mt-12">
          <RecommendedMedia
            items={recommendations}
            type="series"
            title="Similar Series"
          />
        </div>
      </div>
    </div>
  );
}
