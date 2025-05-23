import { Suspense } from "react";
import HeroSlider from "@/components/media/HeroSlider";
import MediaTabs from "@/components/media/MediaTabs";
import MediaGridSkeleton from "@/components/media/MediaGridSkeleton";
import { tmdb } from "@/lib/tmdb";

// import BentoGrid from "@/components/media/BentoGrid";
//

async function getData() {
  const [
    trending,
    popularMovies,
    popularSeries,
    latestMovies,
    latestSeries,
    genres,
  ] = await Promise.all([
    tmdb.getTrending(),
    tmdb.getPopularMovies(),
    tmdb.getPopularSeries(),
    tmdb.getLatestMovies(),
    tmdb.getLatestSeries(),
    tmdb.getGenres(),
  ]);

  return {
    trending: trending.results.slice(0, 5),
    popularMovies: popularMovies.results,
    popularSeries: popularSeries.results,
    latestMovies: latestMovies.results,
    latestSeries: latestSeries.results,
    genres,
  };
}

export default async function HomePage() {
  const {
    trending,
    popularMovies,
    popularSeries,
    latestMovies,
    latestSeries,
    genres,
  } = await getData();

  return (
    <div className="min-h-screen pb-8">
      <HeroSlider items={trending} />

      <div className="container mx-auto px-4 mt-16">
        <h2 className="text-2xl font-montserrat font-bold mb-6 ">Popular</h2>
        <Suspense fallback={<MediaGridSkeleton count={10} />}>
          <MediaTabs
            movies={popularMovies}
            series={popularSeries}
            genres={genres}
          />
        </Suspense>
      </div>
      <div className="container mx-auto px-4 mt-16">
        <h2 className="text-2xl font-montserrat font-bold mb-6 ">Latest</h2>
        <Suspense fallback={<MediaGridSkeleton count={10} />}>
          <MediaTabs
            movies={latestMovies}
            series={latestSeries}
            genres={genres}
          />
        </Suspense>
      </div>
    </div>
  );
}
