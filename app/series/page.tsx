import { Suspense } from "react";
import { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import SeriesClientPage from "./SeriesClientPage";
import { Tv } from "lucide-react";

export const metadata: Metadata = {
  title: "TV Series | StreamScape",
  description: "Browse and watch the latest TV shows and series on StreamScape",
};

// Number of series per page
const ITEMS_PER_PAGE = 20;

async function getSeriesData(
  sortBy: string = "popularity.desc",
  page: number = 1
) {
  try {

    let endpoint;
    switch (sortBy) {
      case "first_air_date.desc":
        endpoint = "tv/on_the_air";
        break;
      case "vote_average.desc":
        endpoint = "tv/top_rated";
        break;
      case "popularity.desc":
      default:
        endpoint = "tv/popular";
        break;
    }

    const res = await fetch(
      `https://api.themoviedb.org/3/${endpoint}?language=en-US&page=${page}`,
      {
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
        }
      }
    );

    if (!res.ok) throw new Error(`Failed to fetch series: ${res.status}`);
    
    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching series:", error);
    return { results: [], page: 1, total_pages: 0, total_results: 0 };
  }
}

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const sortParam = searchParams.sort?.toString() || "popularity.desc";
  const pageParam = searchParams.page?.toString() || "1";
  const currentPage = parseInt(pageParam, 10) || 1;
  
  const genres = await tmdb.getGenres();
  const { results: series, total_pages } = await getSeriesData(sortParam, currentPage);

  const sortOptions = [
    { value: "popularity.desc", label: "Most Popular" },
    { value: "vote_average.desc", label: "Highest Rated" },
    { value: "first_air_date.desc", label: "Latest" },
  ];

  return (
    <div className="min-h-screen pb-16">
      <div className="relative">
        {/* Hero Section */}
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
                  <Tv className="w-3.5 h-3.5 mr-1.5" />
                  Explore Series
                </div>
                <h1 className="text-4xl md:text-5xl font-montserrat font-bold text-foreground">
                  TV Series Collection
                </h1>
                <p className="text-muted-foreground text-lg">
                  Discover and stream the latest TV shows, binge-worthy series, and critically acclaimed dramas.
                </p>
              </div>

              <div className="mt-8 md:mt-0 flex items-center gap-3 md:justify-end">
                <div className="w-12 h-12 bg-card border rounded-full flex items-center justify-center shadow-sm">
                  <Tv className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">{series.length}+</div>
                  <div className="text-sm text-muted-foreground">
                    Top Series
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8">
        <Suspense fallback={<div>Loading series...</div>}>
          <SeriesClientPage 
            initialSeries={series} 
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