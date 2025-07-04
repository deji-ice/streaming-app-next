import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import { MovieDetails, MoviePageProps } from "@/types";
import dynamic from "next/dynamic";

const CastList = dynamic(() => import("@/components/media/CastList"), {
  loading: () => <div>Loading cast...</div>,
});
const RecommendedMedia = dynamic(
  () => import("@/components/media/RecommendedMedia"),
  {
    loading: () => <div>Loading recommendations...</div>,
  }
);
const MediaInfo = dynamic(() => import("@/components/media/MediaInfo"), {
  loading: () => <div>Loading movie details...</div>,
  ssr: false
});

const VideoPlayer = dynamic(() => import("@/components/media/VideoPlayer"), {
  loading: () => <div>Loading player...</div>,
});

// Type guard for MovieDetails
function isMovieDetails(movie: any): movie is MovieDetails {
  return (
    movie !== null &&
    typeof movie === "object" &&
    "id" in movie &&
    typeof (movie as MovieDetails).id === "number" &&
    "title" in movie &&
    typeof (movie as MovieDetails).title === "string"
  );
}

export async function generateMetadata({
  params,
}: MoviePageProps): Promise<Metadata> {
  const slug = (await params).slug;
  const movie = await getMovieDetails(slug);

  if (!movie) {
    return {
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
    };
  }

  const posterUrl = movie.poster_path
    ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    : "https://www.streamscapex.live/placeholder-poster.jpg";

  return {
    title: `${movie.title} - Watch Now`,
    description: movie.overview,
    keywords: [
      movie.title,
      ...(movie.genres?.map((g) => g.name) || []),
      "watch online",
      "streaming",
      "HD movie",
    ],
    openGraph: {
      title: `${movie.title} - StreamScapeX`,
      description: movie.overview,
      url: `https://www.streamscapex.live/movie/${slug}`,
      type: "video.movie",
      images: [
        {
          url: posterUrl,
          width: 500,
          height: 750,
          alt: movie.title,
        },
      ],
      videos: [
        {
          url: `https://www.streamscapex.live/movie/${slug}`,
          type: "video/mp4",
        },
      ],
      tags: movie.genres?.map((g) => g.name) || [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${movie.title} - Watch Now`,
      description: movie.overview,
      images: [posterUrl],
    },
  };
}
export const revalidate = 60;
async function getMovieDetails(slug: string): Promise<MovieDetails | null> {
  const id = slug.split("-").pop();
  if (!id || isNaN(Number(id))) return null;

  try {
    const movie = await tmdb.getMediaDetails(id, "movie");
    if (!isMovieDetails(movie)) {
      throw new Error("Invalid movie data received");
    }
    return movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export default async function MoviePage({ params }: MoviePageProps) {
  try {
    const slug = (await params).slug;
    const movie = await getMovieDetails(slug);

    if (!movie) {
      notFound();
    }

    const recommendations = await tmdb
      .getRecommendations(movie.id, "movie")
      .catch(() => []);

    return (
      <div className="min-h-screen pb-8">
        {/* Movie Schema.org structured data */}

        <div className="relative aspect-video w-full">
          <VideoPlayer
            tmdbId={movie.id}
            type="movie"
            posterPath={movie.backdrop_path ?? movie.poster_path ?? ""}
            title={movie.title}
          />
        </div>

        <div className="container mx-auto px-4 py-8">
          <MediaInfo
            type={"movie"}
            tmdbId={movie.id}
            title={movie.title}
            overview={movie.overview}
            releaseDate={movie.release_date}
            rating={movie.vote_average}
            posterPath={movie.poster_path ?? ""}
            genres={movie.genres?.map((g) => g.name) ?? []}
            duration={movie.runtime ?? 0}
            cast={movie.credits?.cast ?? []}
            country={movie.production_countries[0]?.name ?? "United States"}
          />

          <div className="mt-12">
            <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
            <CastList cast={movie.credits?.cast ?? []} />
          </div>

          <div className="mt-12">
            <RecommendedMedia
              items={recommendations}
              type="movie"
              title="Similar Movies"
            />
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering movie page:", error);
    notFound();
  }
}
