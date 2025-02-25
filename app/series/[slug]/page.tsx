import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import VideoPlayer from "@/components/media/VideoPlayer";
import MediaInfo from "@/components/media/MediaInfo";
import CastList from "@/components/media/CastList";
import SeasonSelector from "@/components/media/SeasonSelector";
import EpisodeGrid from "@/components/media/EpisodeGrid";
import RecommendedMedia from "@/components/media/RecommendedMedia";
import { SeriesPageProps, SeriesDetails, Season } from "@/types";

// Type guard for series data
function isSeriesDetails(data: unknown): data is SeriesDetails {
  return (
    data !== null &&
    typeof data === "object" &&
    "id" in data &&
    "name" in data &&
    "seasons" in data
  );
}

export async function generateMetadata({
  params,
}: SeriesPageProps): Promise<Metadata> {
  const { slug } = await params;
  const series = await getSeriesDetails(slug);

  if (!series) {
    return {
      title: "Series Not Found",
      description: "The requested series could not be found.",
    };
  }

  return {
    title: `${series.name} | StreamScape`,
    description: series.overview,
  };
}

async function getSeriesDetails(
  slug: string, 
  currentSeason: number = 1
): Promise<SeriesDetails | null> {
  const id = slug.split("-").pop();
  if (!id || isNaN(Number(id))) return null;

  try {
    const seriesData = await tmdb.getMediaDetails(id, "tv");
    if (!isSeriesDetails(seriesData)) {
      throw new Error("Invalid series data");
    }

    const seasonDetails = await tmdb.getSeasonDetails(
      Number(id),
      currentSeason
    );

    return {
      ...seriesData,
      seasons: seriesData.seasons.map((season: Season) => ({
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

export default async function SeriesPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const slug = (await params).slug;
  const seriesId = slug.split("-").pop();
  const { season, episode } = await searchParams;
  const currentSeason = Number(season) || 1;
  const currentEpisode = Number(episode) || 1; // Ensure this is parsed

  const series = await getSeriesDetails(slug, currentSeason);

  if (!series) {
    notFound();
  }

  const recommendations = await tmdb
    .getRecommendations(series.id, "tv")
    .catch(() => []);

  return (
    <div className="min-h-screen pb-8">
      <div className="relative aspect-video w-full">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer
            key={`${currentSeason}-${currentEpisode}`}
            tmdbId={seriesId!}
            type="series"
            posterPath={series.backdrop_path ?? series.poster_path ?? ""}
            title={series.name}
            episode={{
              season: currentSeason,
              number: currentEpisode, // Pass the correct episode number from URL
            }}
          />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MediaInfo
          title={series.name}
          overview={series.overview}
          releaseDate={series.first_air_date}
          rating={series.vote_average}
          posterPath={series.poster_path ?? ""}
          genres={series.genres.map((g) => g.name)}
          duration={series.episode_run_time?.[0] ?? 0}
          cast={series.credits.cast}
          country={series.production_countries[0]?.name ?? "United States"}
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
              seriesId={slug}
              currentSeason={currentSeason}
            />
          </Suspense>
        </div>

        <div className="mt-12">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
          <CastList cast={series.credits.cast} />
        </div>

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
