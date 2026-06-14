import { notFound } from "next/navigation";
import { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import SeasonSelector from "@/components/media/SeasonSelector";
import { SeriesPageProps, Series } from "@/types";
import nextDynamic from "next/dynamic";
import { getSeriesDetails } from "@/lib/utils";

export const dynamic = "force-dynamic";

const VideoPlayer = nextDynamic(
  () => import("@/components/media/VideoPlayer"),
  {
    loading: () => <div>Loading player...</div>,
  },
);
const MediaInfo = nextDynamic(() => import("@/components/media/MediaInfo"), {
  loading: () => <div>Loading movie details...</div>,
});
const CastList = nextDynamic(() => import("@/components/media/CastList"), {
  loading: () => <div>Loading cast...</div>,
});
const RecommendedMedia = nextDynamic(
  () => import("@/components/media/RecommendedMedia"),
  {
    loading: () => <div>Loading recommendations...</div>,
  },
);
const EpisodeGrid = nextDynamic(
  () => import("@/components/media/EpisodeGrid"),
  {
    loading: () => (
      <div className="grid gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-32 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    ),
  },
);

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

  const posterUrl = series.poster_path
    ? `https://image.tmdb.org/t/p/w500${series.poster_path}`
    : "https://www.streamscapex.live/placeholder-poster.jpg";

  return {
    title: `${series.name} - Watch Now`,
    description: series.overview,
    keywords: [
      series.name,
      ...series.genres.map((g) => g.name),
      "TV series",
      "watch online",
      "streaming",
      "episodes",
      "seasons",
    ],
    openGraph: {
      title: `${series.name} - StreamScapeX`,
      description: series.overview,
      url: `https://www.streamscapex.live/series/${slug}`,
      type: "video.tv_show",
      images: [
        {
          url: posterUrl,
          width: 500,
          height: 750,
          alt: series.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${series.name} - Watch Now`,
      description: series.overview,
      images: [posterUrl],
    },
  };
}

export default async function SeriesPage({
  params,
  searchParams,
}: SeriesPageProps) {
  const slug = (await params).slug;
  const seriesId = slug.split("-").pop();
  const tmdbId = Number(seriesId);
  const { season, episode } = await searchParams;
  const currentSeason = Number(season) || 1;

  const currentEpisode = Number(episode) || 1; // default to first episode

  const series = await getSeriesDetails(slug, currentSeason);
  const seasonData = series?.seasons.find(
    (s) => s.season_number === currentSeason,
  );
  const seasonEpisodesLength = seasonData?.episodes.length || 0;

  if (!series) {
    notFound();
  }

  const recommendations = await tmdb
    .getRecommendations(series.id, "tv")
    .catch(() => []);

  return (
    <div className="min-h-screen pb-8">
      {/* TV Series Schema.org structured data */}
      <div className="w-full">
        <VideoPlayer
          key={`${currentSeason}-${currentEpisode}`}
          tmdbId={seriesId!}
          type="series"
          posterPath={series.backdrop_path ?? series.poster_path ?? ""}
          title={series.name}
          episode={{
            season: currentSeason,
            number: currentEpisode,
          }}
          seasonLength={seasonEpisodesLength}
        />
      </div>

      <div className="container mx-auto px-4 py-8">
        <MediaInfo
          type={"series"}
          tmdbId={tmdbId}
          title={series.name}
          overview={series.overview}
          releaseDate={series.first_air_date}
          rating={series.vote_average}
          posterPath={series.poster_path ?? ""}
          genres={series.genres.map((g) => g.name)}
          duration={series.last_episode_to_air.runtime ?? 0}
          cast={series.credits.cast}
          country={series.production_countries[0]?.name ?? "United States"}
          season={currentSeason}
          episode={currentEpisode}
        />

        <div className="mt-10 md:mt-14 space-y-5">
          <div className="flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="font-montserrat text-xl font-bold tracking-tight sm:text-2xl">
              Episodes
            </h2>
            <SeasonSelector
              seasons={series.seasons}
              currentSeason={currentSeason}
            />
          </div>

          <EpisodeGrid
            episodes={
              series.seasons.find((s) => s.season_number === currentSeason)
                ?.episodes || []
            }
            seriesId={slug}
            currentSeason={currentSeason}
            currentEpisode={currentEpisode}
          />
        </div>

        <div className="mt-10 md:mt-14">
          <h2 className="mb-5 border-b border-border pb-2 font-montserrat text-xl font-bold tracking-tight sm:text-2xl">
            Cast
          </h2>
          <CastList cast={series.credits.cast} />
        </div>

        <div className="mt-10 md:mt-14">
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
