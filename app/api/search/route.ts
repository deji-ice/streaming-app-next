import { NextRequest, NextResponse } from 'next/server';
import { tmdb } from '@/lib/tmdb';

export const runtime = 'edge';

type SearchResultItem = {
    release_date?: string;
    first_air_date?: string;
    vote_average?: number;
};

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');
        const type = searchParams.get('type'); // 'movie', 'tv', or null for multi
        const year = searchParams.get('year');
        const minRating = searchParams.get('minRating');
        const page = searchParams.get('page') || '1';

        if (!query) {
            return NextResponse.json(
                { error: 'Query parameter is required' },
                { status: 400 }
            );
        }

        if (query.length < 2) {
            return NextResponse.json(
                { results: [], page: 1, total_pages: 0, total_results: 0 },
                { status: 200 }
            );
        }

        const results = await tmdb.searchMulti(query);

        // Apply additional filters on results
        if (results.results) {
            results.results = results.results.filter((item: SearchResultItem & { media_type?: string }) => {
                if (type === 'movie' && item.media_type !== 'movie') {
                    return false;
                }

                if (type === 'tv' && item.media_type !== 'tv') {
                    return false;
                }

                // Filter by year if provided
                if (year) {
                    const itemYear = item.release_date
                        ? new Date(item.release_date).getFullYear()
                        : item.first_air_date
                            ? new Date(item.first_air_date).getFullYear()
                            : null;

                    if (itemYear !== parseInt(year)) {
                        return false;
                    }
                }

                // Filter by minimum rating if provided
                if (minRating) {
                    const rating = item.vote_average || 0;
                    if (rating < parseFloat(minRating)) {
                        return false;
                    }
                }

                return true;
            });
        }

        return NextResponse.json(results, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1800',
            },
        });
    } catch (error) {
        console.error('Search API error:', error);
        return NextResponse.json(
            { error: 'Failed to search', results: [], page: 1, total_pages: 0, total_results: 0 },
            { status: 500 }
        );
    }
}
