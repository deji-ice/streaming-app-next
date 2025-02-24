import { Suspense } from "react";
import { notFound } from "next/navigation";
import { tmdb } from "@/lib/tmdb";
import VideoPlayer from "@/components/media/VideoPlayer";
import MediaInfo from "@/components/media/MediaInfo";
import CastList from "@/components/media/CastList";
import RecommendedMedia from "@/components/media/RecommendedMedia";

// Define the expected props for the page component
interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

/**
 * Fetches detailed movie information from TMDB API using the slug
 * @param slug - URL slug containing the movie ID (format: "movie-title-123")
 * @returns Movie details object or null if not found
 */
async function getMovieDetails(slug: string) {
  // Extract ID from the last part of the slug
  const id = slug.split("-").pop();
  if (!id) return null;

  try {
    // Fetch movie details using TMDB client
    const movie = await tmdb.getMediaDetails(id.toString(), "movie");
    return movie;
  } catch (error) {
    console.error("Error fetching movie details:", error);
    return null;
  }
}

/**
 * Movie details page component
 * Displays video player, movie information, and cast list
 */
export default async function MoviePage({ params }: PageProps) {
  const resolvedParams = await params;
  // Fetch movie details using the URL slug
  const movie = await getMovieDetails(resolvedParams.slug);
  // Fetch recommendations in parallel with movie details
  const recommendations = await tmdb.getRecommendations(movie.id, "movie");

  // Show 404 page if movie is not found
  if (!movie) {
    notFound();
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Video Player Section */}
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

      {/* Movie Details Section */}
      <div className="container mx-auto px-4 py-8">
        {/* Movie Information Component */}
        <MediaInfo
          title={movie.title}
          overview={movie.overview}
          releaseDate={movie.release_date}
          rating={movie.vote_average}
          posterPath={movie.poster_path}
          genres={movie.genres.map((g: { name: string }) => g.name)}
          duration={movie.runtime}
          cast={movie.credits.cast}
          country={movie.production_countries[0]?.name || "United States"}
        />

        {/* Cast Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-montserrat font-bold mb-6">Cast</h2>
          <CastList cast={movie.credits.cast} />
        </div>

        {/* Add Recommendations */}
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
}
