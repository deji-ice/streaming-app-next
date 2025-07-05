const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

import type { Movie, Series, MovieDetails, SeriesDetails, Genre, Episode } from "@/types";

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
    const res = await fetch(`${BASE_URL}/trending/movie/week`, options);
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  },

  async getPopularMovies(): Promise<TMDBResponse<Movie>> {
    const res = await fetch(`${BASE_URL}/movie/popular`, options);
    if (!res.ok) throw new Error('Failed to fetch popular movies');
    return res.json();
  },

  async getPopularSeries(): Promise<TMDBResponse<SeriesDetails>> {
    const res = await fetch(`${BASE_URL}/trending/tv/week`, options);

    if (!res.ok) throw new Error('Failed to fetch trending series');

    const popularSeriesResponse: TMDBResponse<SeriesDetails> = await res.json()

    const detailedSeries = await Promise.all(
      popularSeriesResponse.results.map(series => this.getMediaDetails(String(series.id), "tv"))
    )

    return {
      page: popularSeriesResponse.page,
      total_pages: popularSeriesResponse.total_pages,
      total_results: popularSeriesResponse.total_results,
      results: detailedSeries as SeriesDetails[],
    }
  },

  async getMediaDetails(id: string, type: MediaType): Promise<MovieDetails | SeriesDetails> {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}?append_to_response=credits`,
      options
    );
    if (!res.ok) throw new Error(`Failed to fetch ${type} details`);
    return res.json();
  },

  async searchMulti(query: string): Promise<TMDBResponse<Movie | Series>> {
    try {
      const res = await fetch(
        `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
        options
      )
      if (!res.ok) throw new Error("Failed to search")
      return res.json()
    } catch (error) {
      console.error("Error:", error)
      return { results: [], page: 1, total_pages: 0, total_results: 0 }
    }
  },

  async getSeasonDetails(
    seriesId: number,
    seasonNumber: number
  ): Promise<{ episodes: Episode[] }> {
    try {
      const res = await fetch(
        `${BASE_URL}/tv/${seriesId}/season/${seasonNumber}`,
        options
      );
      if (!res.ok) throw new Error('Failed to fetch season details');
      const data = await res.json();
      return data;
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
      const res = await fetch(
        `${BASE_URL}/${type}/${id}/recommendations`,
        options
      );
      if (!res.ok) throw new Error(`Failed to fetch ${type} recommendations`);
      const data = await res.json();
      return data.results.slice(0, 10); // Limit to 10 recommendations
    } catch (error) {
      console.error(`Error fetching ${type} recommendations:`, error);
      return [];
    }
  },

  async getGenres(): Promise<Genre[]> {
    try {
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
    } catch (error) {
      console.error("Error fetching genres:", error);
      return [];
    }
  },

  async getLatestMovies(sortBy: string = 'release_date.desc'): Promise<TMDBResponse<Movie>> {
    try {
      const res = await fetch(
        `${BASE_URL}/movie/now_playing?language=en-US&page=1&sort_by=${sortBy}`,
        options
      );
      if (!res.ok) throw new Error('Failed to fetch now playing movies');
      return res.json();
    } catch (error) {
      console.error('Error:', error);
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  async getLatestSeries(sortBy: string = 'latest_air_date.desc'): Promise<TMDBResponse<SeriesDetails>> {
    const today = new Date().toISOString().slice(0, 10);
    try {
      // Exclude news (genre ID 10763) and talk shows (genre ID 10767) from results
      const res = await fetch(
        `${BASE_URL}/discover/tv?language=en-US&page=1&sort_by=${sortBy}&without_genres=10763,10767,99,10764&first_air_date.lte=${today}`,
        options
      );
      if (!res.ok) throw new Error('Failed to fetch latest series');
      const latestSeriesResponse: TMDBResponse<Series> = await res.json()

      const detailedSeries = await Promise.all(
        latestSeriesResponse.results.map(series => this.getMediaDetails(String(series.id), "tv"))
      )

      return {
        page: latestSeriesResponse.page,
        total_pages: latestSeriesResponse.total_pages,
        total_results: latestSeriesResponse.total_results,
        results: detailedSeries as SeriesDetails[],
      }

    } catch (error) {
      console.error('Error:', error);
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
  },

  async getTrailers(id: number, type: MediaType): Promise<string | null> {
    try {
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
    } catch (error) {
      console.error('Error fetching trailers:', error);
      return null;
    }
  }
};