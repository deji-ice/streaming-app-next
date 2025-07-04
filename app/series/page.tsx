import { Metadata } from "next";
import { tmdb } from "@/lib/tmdb";
import { Tv } from "lucide-react";
import { SeriesPageProps, Series } from "@/types";
import dynamic from "next/dynamic";

export const metadata: Metadata = {
  title: "TV Series | StreamScape",
  description: "Browse and watch the latest TV shows and series on StreamScape",
};
type SeriesData = {
  results: Series[];
  page: number;
  total_pages: number;
  total_results: number;
};

const SeriesClientPage = dynamic(() => import("./SeriesClientPage"), {
  loading: () => <div>Loading series...</div>,
});

async function getSeriesData(
  sortBy: string = "popularity.desc",
  page: number = 1
): Promise<SeriesData | null> {
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
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
        },
      }
    );

    if (!res.ok) throw new Error(`Failed to fetch series: ${res.status}`);

    const data = await res.json();
    return data;
  } catch (error) {
    console.error("Error fetching series:", error);
    return {
      results: [] as Series[],
      page: 1,
      total_pages: 0,
      total_results: 0,
    };
  }
}
export const revalidate = 60;

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  const params = await searchParams;
  const sortParam = params.sort?.toString() || "popularity.desc";
  const pageParam = params.page?.toString() || "1";
  const currentPage = parseInt(pageParam, 10) || 1;

  const genres = await tmdb.getGenres();
  const seriesData = await getSeriesData(sortParam, currentPage);
  const series = seriesData ? seriesData.results : [];
  const total_pages = seriesData ? seriesData.total_pages : 0;

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
                  Discover and stream the latest TV shows, binge-worthy series,
                  and critically acclaimed dramas.
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
        <SeriesClientPage
          initialSeries={series}
          sortOptions={sortOptions}
          currentSort={sortParam}
          currentPage={currentPage}
          totalPages={total_pages}
          genres={genres}
        />
      </div>
    </div>
  );
}
