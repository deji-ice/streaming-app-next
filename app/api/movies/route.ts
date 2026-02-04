import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const endpoint = searchParams.get("endpoint") || "popular";
    const page = searchParams.get("page") || "1";

    try {
        const res = await fetch(
            `https://api.themoviedb.org/3/${endpoint}?language=en-US&page=${page}`,
            {
                headers: {
                    accept: "application/json",
                    Authorization: `Bearer ${process.env.TMDB_API_KEY || process.env.NEXT_PUBLIC_TMDB_API_KEY}`,
                },
                next: { revalidate: 3600 }, // Revalidate every hour
            }
        );

        if (!res.ok) {
            throw new Error(`Failed to fetch movies: ${res.status}`);
        }

        const data = await res.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Error fetching movies:", error);
        return NextResponse.json(
            { error: "Failed to fetch movies", results: [] },
            { status: 500 }
        );
    }
}