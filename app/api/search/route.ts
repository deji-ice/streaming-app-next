import { NextRequest, NextResponse } from 'next/server';
import { tmdb } from '@/lib/tmdb';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('q');

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

        return NextResponse.json(results, {
            status: 200,
            headers: {
                'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600',
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
