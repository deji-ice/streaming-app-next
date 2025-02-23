import { Suspense } from "react";
import { notFound } from "next/navigation";
import { tmdb } from "@/lib/tmdb";
import VideoPlayer from "@/components/media/VideoPlayer";
import MediaInfo from "@/components/media/MediaInfo";
import CastList from "@/components/media/CastList";

interface PageProps {
  params: {
    slug: string;
  };
}

async function getMovieDetails(slug: string) {
  // Extract ID from slug (e.g., "movie-title-123" -> "123")
  const id = slug.split("-").pop();
  if (!id) return null;

  try {
    const movie = await tmdb.getMediaDetails(parseInt(id), "movie");
    return movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

export default async function MoviePage({ params }: PageProps) {
  const movie = await getMovieDetails(params.slug);

  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-8">
      <div className="relative aspect-video w-full">
        <Suspense fallback={<div>Loading player...</div>}>
          <VideoPlayer
            tmdbId={movie.id}
            type="movie"
            posterPath={movie.backdrop_path || movie.poster_path}
            title={movie.title}
          />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 py-8">
        <MediaInfo
          title={movie.title}
          overview={movie.overview}
          releaseDate={movie.release_date}
          rating={movie.vote_average}
          posterPath={movie.poster_path}
          genres={movie.genres.map((g) => g.name)}
          duration={movie.runtime}
          cast={movie.credits.cast}
          country={movie.production_countries[0]?.name || "United States"}
        />

        <div className="mt-12">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
          <CastList cast={movie.credits.cast} />
        </div>
      </div>
    </div>
  );
}
