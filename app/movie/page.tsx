import { Suspense } from "react";
import { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import MoviesClientPage from "./MoviesClientPage";
import { Film } from "lucide-react";

export const metadata: Metadata = {
  title: "Movies | StreamScape",
  description: "Browse and watch the latest movies on StreamScape",
};

// interface SearchParams {
//   sort?: Promise<{ string | string[]}>
//   page?: Promise<{ string | string[] }>
// }

interface MoviePageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// interface MoviePageProps {
//   searchParams: SearchParams;
// }

import { Movie as MovieType } from "@/types";

interface Movie extends MovieType {
  title: string;
  release_date: string;
}

type MovieData = {
  sortBy: string;
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
};

async function getMoviesData(
  sortBy: string = "popularity.desc",
  page: number = 1
): Promise<MovieData | null> {
  try {
    let endpoint;
    switch (sortBy) {
      case "release_date.desc":
        endpoint = "movie/now_playing";
        break;
      case "vote_average.desc":
        endpoint = "movie/top_rated";
        break;
      case "popularity.desc":
      default:
        endpoint = "movie/popular";
        break;
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?language=en-US&page=${page}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error(`Failed to fetch movies: ${res.status}`);

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching movies:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0, sortBy };
  }
}

export default async function MoviesPage({
  searchParams,
}: MoviePageProps) {
  const sortParam = (await searchParams).sort?.toString() || "popularity.desc";
  const pageParam = (await searchParams).page?.toString() || "1";
  const currentPage = parseInt(pageParam, 10) || 1;

  const genres = await tmdb.getGenres();
  const movieData = await getMoviesData(sortParam, currentPage);
  const movies = movieData ? movieData.results : [];
  const total_pages = movieData ? movieData.total_pages : 0;

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "release_date.desc", label: "Latest" },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="relative">
        {/* Hero Section - Redesigned for both dark and light modes */}
        <div className="bg-card border-b border-border pt-28 pb-16 relative">
          <div className="absolute inset-0 overflow-hidden z-0">
            <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10"></div>
            <div className="absolute top-0 left-0 w-full h-20 bg-background/60 backdrop-blur-sm"></div>
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
            <div className="absolute -bottom-32 -right-12 w-80 h-80 rounded-full bg-primary/10 dark:bg-primary/20 blur-3xl"></div>
          </div>

          <div className="container mx-auto px-4 md:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="space-y-4 max-w-2xl">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                  <Film className="w-3.5 h-3.5 mr-1.5" />
                  Explore Movies
                </div>
                <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-foreground">
                  Movies Collection
                </h1>
                <p className="text-muted-foreground text-lg">
                  Discover and stream the latest blockbusters, timeless
                  classics, and everything in between.
                </p>
              </div>

              <div className="mt-8 md:mt-0 flex items-center gap-3 md:justify-end">
                <div className="w-12 h-12 bg-card border rounded-full flex items-center justify-center shadow-sm">
                  <Film className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{movies.length}+</div>
                  <div className="text-sm text-muted-foreground">
                    Top Movies
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <Suspense fallback={<div>Loading movies...</div>}>
          <MoviesClientPage
            initialMovies={movies}
            sortOptions={sortOptions}
            currentSort={sortParam}
            currentPage={currentPage}
            totalPages={total_pages}
            genres={genres}
          />
        </Suspense>
      </div>
    </div>
  );
}
