/**
 * Query key factory for TanStack Query
 * Provides consistent, type-safe cache keys across the app
 */

export const queryKeys = {
    // Movies
    movies: {
        all: ['movies'] as const,
        lists: () => [...queryKeys.movies.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.movies.lists(), filters] as const,
        details: () => [...queryKeys.movies.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.movies.details(), id] as const,
        trending: () => [...queryKeys.movies.all, 'trending'] as const,
        popular: () => [...queryKeys.movies.all, 'popular'] as const,
        latest: (sortBy: string) => [...queryKeys.movies.all, 'latest', sortBy] as const,
    },

    // Series
    series: {
        all: ['series'] as const,
        lists: () => [...queryKeys.series.all, 'list'] as const,
        list: (filters: Record<string, unknown>) => [...queryKeys.series.lists(), filters] as const,
        details: () => [...queryKeys.series.all, 'detail'] as const,
        detail: (id: string) => [...queryKeys.series.details(), id] as const,
        popular: () => [...queryKeys.series.all, 'popular'] as const,
        latest: (sortBy: string) => [...queryKeys.series.all, 'latest', sortBy] as const,
        season: (seriesId: number, seasonNumber: number) =>
            [...queryKeys.series.detail(String(seriesId)), 'season', seasonNumber] as const,
    },

    // Search
    search: {
        all: ['search'] as const,
        query: (q: string, filters?: Record<string, unknown>) =>
            [...queryKeys.search.all, q, filters] as const,
    },

    // Genres
    genres: {
        all: ['genres'] as const,
    },

    // Recommendations
    recommendations: {
        all: ['recommendations'] as const,
        media: (id: number, type: 'movie' | 'tv') =>
            [...queryKeys.recommendations.all, type, id] as const,
    },

    // Trailers
    trailers: {
        all: ['trailers'] as const,
        media: (id: number, type: 'movie' | 'tv') =>
            [...queryKeys.trailers.all, type, id] as const,
    },
} as const;
