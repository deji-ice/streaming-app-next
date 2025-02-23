const TMDB_TOKEN = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const options = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${TMDB_TOKEN}`
  }
};

export const tmdb = {
  async getTrending() {
    const res = await fetch(`${BASE_URL}/trending/all/day`, options);
    if (!res.ok) throw new Error('Failed to fetch trending');
    return res.json();
  },

  async getPopularMovies() {
    const res = await fetch(`${BASE_URL}/movie/popular`, options);
    if (!res.ok) throw new Error('Failed to fetch popular movies');
    return res.json();
  },

  async getPopularSeries() {
    const res = await fetch(`${BASE_URL}/tv/popular`, options);
    if (!res.ok) throw new Error('Failed to fetch popular series');
    return res.json();
  },

  async getMediaDetails(id: string, type: 'movie' | 'tv') {
    const res = await fetch(
      `${BASE_URL}/${type}/${id}?append_to_response=credits`,
      options
    );
    if (!res.ok) throw new Error(`Failed to fetch ${type} details`);
    return res.json();
  },

  async searchMedia(query: string) {
    const res = await fetch(
      `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
      options
    );
    if (!res.ok) throw new Error('Failed to search');
    return res.json();
  },
  async searchMulti(query: string) {
    try {
      const res = await fetch(
        `${BASE_URL}/search/multi?query=${encodeURIComponent(query)}`,
        options
      )
      if (!res.ok) throw new Error("Failed to search")
      return res.json()
    } catch (error) {
      console.error("Error:", error)
      return { results: [] }
    }
  },
};