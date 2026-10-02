import type { Metadata } from "next";

import { BecauseYouWatched } from "@/components/home/because-you-watched";
import { HOME_PAGE_CLASS } from "@/components/home/classes";
import { ContinueWatching } from "@/components/home/continue-watching";
import { GenreGrid } from "@/components/home/genre-grid";
import { pickGenreTiles, uniqueCards } from "@/components/home/genres";
import {
  PosterRail,
  RankedRail,
  StreamingServicesRail,
  TheatersRail,
} from "@/components/home/rails";
import { loadSpotlightItems, Spotlight, SPOTLIGHT_COUNT } from "@/components/home/spotlight";
import { tmdbImage } from "@/lib/tmdb-image";
import {
  getGenres,
  getMovieList,
  getNowPlayingMovies,
  getTrending,
  getTvList,
} from "@/lib/tmdb/lists";
import type { GenreDTO } from "@/lib/tmdb/types";

/** The lists change about every half hour (trending is cached for 30 minutes). */
export const revalidate = 1800;

const HOME_TITLE = "StreamScapeX - Watch Movies & TV Shows Online";
const HOME_DESCRIPTION =
  "Trending movies and series this week, new releases in theaters, top rated titles and streaming services. See trailers, cast and where to watch.";

/** Region for "New in theaters". The page is static, so it cannot follow the visitor's country. */
const THEATERS_REGION = "US";

export async function generateMetadata(): Promise<Metadata> {
  // Same cached call the page makes, so this adds no TMDB request.
  const trending = await getTrending("movie", "week").catch(() => null);
  const lead = trending?.results.find((card) => card.backdropPath);
  const image = tmdbImage(lead?.backdropPath, "w780");

  return {
    title: { absolute: HOME_TITLE },
    description: HOME_DESCRIPTION,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: "/",
      siteName: "StreamScapeX",
      title: HOME_TITLE,
      description: HOME_DESCRIPTION,
      images: image
        ? [{ url: image, width: 780, height: 439, alt: `Trending this week: ${lead?.title ?? "StreamScapeX"}` }]
        : [{ url: "/og-image.jpg", width: 1200, height: 630, alt: "StreamScapeX" }],
    },
  };
}

/** The value of a settled promise, or null when it failed (that section is then left out). */
function valueOf<T>(result: PromiseSettledResult<T>): T | null {
  return result.status === "fulfilled" ? result.value : null;
}

export default async function HomePage() {
  const trending = getTrending("movie", "week");
  const genres = getGenres("movie");
  // Starts as soon as the trending list arrives, in parallel with the other lists.
  const spotlight = Promise.all([trending, genres.catch((): GenreDTO[] => [])]).then(
    ([list, genreList]) => loadSpotlightItems(list.results, genreList),
  );

  const [
    trendingResult,
    popularMoviesResult,
    popularSeriesResult,
    theatersResult,
    topRatedResult,
    genresResult,
    spotlightResult,
  ] = await Promise.allSettled([
    trending,
    getMovieList("popular"),
    getTvList("popular"),
    getNowPlayingMovies(1, THEATERS_REGION),
    getTvList("top_rated"),
    genres,
    spotlight,
  ]);

  // Without trending there is no spotlight and no Top 10. Fail instead of letting
  // ISR keep a half empty home page for the next 30 minutes: a failed
  // revalidation leaves the last good page in place and the error page covers
  // a cold start.
  if (trendingResult.status === "rejected") throw trendingResult.reason;

  const trendingCards = trendingResult.value.results;
  const popularMovies = valueOf(popularMoviesResult)?.results ?? [];
  const popularSeries = valueOf(popularSeriesResult)?.results ?? [];
  const theaters = (valueOf(theatersResult)?.results ?? []).filter((card) => card.backdropPath);
  const topRatedSeries = valueOf(topRatedResult)?.results ?? [];

  // Backdrops for the genre tiles come from the movie lists above. The hero's
  // own five go last so the tiles do not repeat the first screen.
  const genreTiles = pickGenreTiles(
    valueOf(genresResult) ?? [],
    uniqueCards(
      popularMovies,
      theaters,
      trendingCards.slice(SPOTLIGHT_COUNT),
      trendingCards.slice(0, SPOTLIGHT_COUNT),
    ),
  );

  return (
    <div className={HOME_PAGE_CLASS}>
      <h1 className="sr-only">StreamScapeX</h1>
      <Spotlight items={valueOf(spotlightResult) ?? []} />
      <ContinueWatching />
      <BecauseYouWatched />
      <RankedRail title="Top 10 movies this week" cards={trendingCards.slice(0, 10)} />
      <StreamingServicesRail />
      <PosterRail title="Popular movies" cards={popularMovies} href="/movie" />
      <PosterRail title="Popular series" cards={popularSeries} href="/series" />
      <TheatersRail title="New in theaters" cards={theaters} />
      <GenreGrid tiles={genreTiles} />
      <PosterRail title="Top rated series" cards={topRatedSeries} href="/series?sort=vote_average.desc" />
    </div>
  );
}
