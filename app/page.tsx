import { Suspense } from "react";
import HeroSlider from "@/components/media/HeroSlider";
import MediaGrid from "@/components/media/MediaGrid";
import { tmdb } from "@/lib/tmdb";

async function getData() {
  const [trending, popularMovies, popularSeries] = await Promise.all([
    tmdb.getTrending(),
    tmdb.getPopularMovies(),
    tmdb.getPopularSeries(),
  ]);

  return {
    trending: trending.results.slice(0, 5),
    popularMovies: popularMovies.results,
    popularSeries: popularSeries.results,
  };
}

export default async function HomePage() {
  const { trending, popularMovies, popularSeries } = await getData();

  return (
    <div className="min-h-screen pb-8">
      <HeroSlider items={trending} />
      <div className="space-y-12 mt-8">
        <Suspense fallback={<div>Loading movies...</div>}>
          <MediaGrid
            items={popularMovies}
            type="movies"
            title="Popular Movies"
          />
        </Suspense>
        <Suspense fallback={<div>Loading series...</div>}>
          <MediaGrid
            items={popularSeries}
            type="series"
            title="Popular Series"
          />
        </Suspense>
      </div>
    </div>
  );
}