import type { Movie, Series, MovieDetails, SeriesDetails, Genre, Episode } from "@/types";
import { cachedFetch, cacheKeys } from './tmdb-cache';

// Use server-only token (no NEXT_PUBLIC_ prefix)
const TMDB_TOKEN = process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}
interface VideoResult {
  key: string;
  site: string;
  type: string;
}
type MediaType = 'movie' | 'tv';

export const tmdb = {
  async getTrending(): Promise<TMDBResponse<Movie>> {
    return cachedFetch(
      cacheKeys.trending(),
      async () => {
        const res = await fetch(`${BASE_URL}/trending/movie/week`, options);
        if (!res.ok) throw new Error('Failed to fetch trending');
        return res.json();
      }
    );
  },

  async getPopularMovies(): Promise<TMDBResponse<Movie>> {
    return cachedFetch(
      cacheKeys.popularMovies(),
      async () => {
        const res = await fetch(`${BASE_URL}/movie/popular`, options);
        if (!res.ok) throw new Error('Failed to fetch popular movies');
        return res.json();
      }
    );
  },

  async getPopularSeries(): Promise<TMDBResponse<SeriesDetails>> {
    return cachedFetch(
      cacheKeys.popularSeries(),
      async () => {
        // Use append_to_response to get all data in one request (fixes N+1 query problem)
        const res = await fetch(
          `${BASE_URL}/trending/tv/week?append_to_response=credits`,
          options
        );

        if (!res.ok) throw new Error('Failed to fetch trending series');

        const data: TMDBResponse<SeriesDetails> = await res.json();
        return data;
      }
    );
  },

  async getMediaDetails(id: string, type: MediaType): Promise<MovieDetails | SeriesDetails> {
    const cacheKey = type === 'movie' ? cacheKeys.movieDetails(id) : cacheKeys.seriesDetails(id);

    return cachedFetch(
      cacheKey,
      async () => {
        // Fetch all related data in one request (credits, videos, similar)
        const res = await fetch(
          `${BASE_URL}/${type}/${id}?append_to_response=credits,videos,similar`,
          options
        );
        if (!res.ok) throw new Error(`Failed to fetch ${type} details`);
        return res.json();
      }
    );
  },

  async searchMulti(query: string): Promise<TMDBResponse<Movie | Series>> {
    try {
      return await cachedFetch(
        cacheKeys.search(query),
        async () => {
          const res = await fetch(
            `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
            options
          );
          if (!res.ok) throw new Error("Failed to search");
          return res.json();
        }
      );
    } catch (error) {
      console.error("Error:", error);
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  async getSeasonDetails(
    seriesId: number,
    seasonNumber: number
  ): Promise<{ episodes: Episode[] }> {
    try {
      return await cachedFetch(
        cacheKeys.season(seriesId, seasonNumber),
        async () => {
          const res = await fetch(
            `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`,
            options
          );
          if (!res.ok) throw new Error('Failed to fetch season details');
          return res.json();
        }
      );
    } catch (error) {
      console.error('Error fetching season details:', error);
      return { episodes: [] };
    }
  },

  async getRecommendations(
    id: number,
    type: MediaType
  ): Promise<(Movie | SeriesDetails)[]> {
    try {
      return await cachedFetch(
        cacheKeys.recommendations(id, type),
        async () => {
          const res = await fetch(
            `${BASE_URL}/${type}/${id}/recommendations`,
            options
          );
          if (!res.ok) throw new Error(`Failed to fetch ${type} recommendations`);
          const data = await res.json();
          return data.results.slice(0, 10); // Limit to 10 recommendations
        }
      );
    } catch (error) {
      console.error(`Error fetching ${type} recommendations:`, error);
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    try {
      return await cachedFetch(
        cacheKeys.genres(),
        async () => {
          const [movieGenres, tvGenres] = await Promise.all([
            fetch(`${BASE_URL}/genre/movie/list`, options),
            fetch(`${BASE_URL}/genre/tv/list`, options)
          ]);

          const movieData = await movieGenres.json();
          const tvData = await tvGenres.json();

          // Combine and deduplicate genres
          const allGenres = [...movieData.genres, ...tvData.genres];
          const uniqueGenres = Array.from(new Map(allGenres.map(g => [g.id, g])).values());

          return uniqueGenres;
        }
      );
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  },

  async getLatestMovies(sortBy: string = 'release_date.desc'): Promise<TMDBResponse<Movie>> {
    try {
      return await cachedFetch(
        cacheKeys.latestMovies(sortBy),
        async () => {
          const res = await fetch(
            `${BASE_URL}/movie/now_playing?language=en-US&page=1&sort_by=${sortBy}`,
            options
          );
          if (!res.ok) throw new Error('Failed to fetch now playing movies');
          return res.json();
        }
      );
    } catch (error) {
      console.error('Error:', error);
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  async getLatestSeries(sortBy: string = 'latest_air_date.desc'): Promise<TMDBResponse<SeriesDetails>> {
    const today = new Date().toISOString().slice(0, 10);
    try {
      return await cachedFetch(
        cacheKeys.latestSeries(sortBy),
        async () => {
          // Exclude news (genre ID 10763) and talk shows (genre ID 10767) from results
          // Use append_to_response to get credits in one request (fixes N+1 query problem)
          const res = await fetch(
            `${BASE_URL}/discover/tv?language=en-US&page=1&sort_by=${sortBy}&without_genres=10763,10767,99,10764&first_air_date.lte=${today}&append_to_response=credits`,
            options
          );
          if (!res.ok) throw new Error('Failed to fetch latest series');
          const data: TMDBResponse<SeriesDetails> = await res.json();
          return data;
        }
      );
    } catch (error) {
      console.error('Error:', error);
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  async getTrailers(id: number, type: MediaType): Promise<string | null> {
    try {
      return await cachedFetch(
        cacheKeys.trailers(id, type),
        async () => {
          const res = await fetch(
            `${BASE_URL}/${type}/${id}/videos`,
            options
          );

          if (!res.ok) throw new Error('Failed to fetch trailers');

          const data = await res.json();
          const trailer = data.results?.find((video: VideoResult) =>
            video.type === "Trailer" && video.site === "YouTube"
          );

          if (!trailer) {
            return null;
          }

          return `https://www.youtube.com/embed/${trailer.key}`;
        }
      );
    } catch (error) {
      console.error('Error fetching trailers:', error);
      return null;
    }
  }
};