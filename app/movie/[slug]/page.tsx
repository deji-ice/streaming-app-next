import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from 'next'
import { tmdb } from "@/lib/tmdb";
import VideoPlayer from "@/components/media/VideoPlayer";
import MediaInfo from "@/components/media/MediaInfo";
import CastList from "@/components/media/CastList";
import RecommendedMedia from "@/components/media/RecommendedMedia";
import { MovieDetails , MoviePageProps } from "@/types";

// Type guard for MovieDetails
function isMovieDetails(movie: unknown): movie is MovieDetails {
  return (
    movie !== null &&
    typeof movie === "object" &&
    "id" in movie &&
    typeof (movie as MovieDetails).id === "number" &&
    "title" in movie &&
    typeof (movie as MovieDetails).title === "string"
  );
}

export async function generateMetadata(
  { params }: MoviePageProps
): Promise<Metadata> {
  const  slug  = (await params).slug;
  console.log(slug);
  const movie = await getMovieDetails(slug);

  if (!movie) {
    return {
      title: "Movie Not Found",
      description: "The requested movie could not be found.",
    };
  }

  return {
    title: `${movie.title} | StreamScape`,
    description: movie.overview,
  };
}

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
    const  slug = (await params).slug;
    const movie = await getMovieDetails(slug);

    if (!movie) {
      notFound();
    }

    const recommendations = await tmdb
      .getRecommendations(movie.id, "movie")
      .catch(() => []);

    return (
      <div className="min-h-screen pb-8">
        <div className="relative aspect-video w-full">
          <Suspense fallback={<div>Loading player...</div>}>
            <VideoPlayer
              tmdbId={movie.id}
              type="movie"
              posterPath={movie.backdrop_path ?? movie.poster_path ?? ""}
              title={movie.title}
            />
          </Suspense>
        </div>

        <div className="container mx-auto px-4 py-8">
          <Suspense fallback={<div>Loading movie details...</div>}>
            <MediaInfo
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
          </Suspense>

          <Suspense fallback={<div>Loading cast...</div>}>
            <div className="mt-12">
              <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
              <CastList cast={movie.credits?.cast ?? []} />
            </div>
          </Suspense>

          <Suspense fallback={<div>Loading recommendations...</div>}>
            <div className="mt-12">
              <RecommendedMedia
                items={recommendations}
                type="movie"
                title="Similar Movies"
              />
            </div>
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering movie page:", error);
    notFound();
  }
}
