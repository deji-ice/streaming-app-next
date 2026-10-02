import { NextRequest, NextResponse } from "next/server";
import { withLegacyFields } from "@/lib/tmdb/legacy";
import { clampPage, getMovieList, isMovieList } from "@/lib/tmdb/lists";

/**
 * GET /api/movies?endpoint=popular|top_rated|now_playing|upcoming&page=1..500
 * ("movie/popular" style values are accepted too). Anything else is a 400:
 * this route used to proxy any TMDB path with the app's token.
 *
 * Response: { results: CardDTO rows (+ snake_case aliases), page, totalPages,
 * totalResults, total_pages, total_results }.
 */

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const endpoint = (params.get("endpoint") ?? "popular").replace(/^\/?movie\//, "");
  if (!isMovieList(endpoint)) {
    return NextResponse.json(
      { error: "endpoint must be one of popular, top_rated, now_playing, upcoming", results: [] },
      { status: 400 },
    );
  }
  const page = clampPage(params.get("page"));

  try {
    const paged = await getMovieList(endpoint, page);
    return NextResponse.json(
      {
        results: paged.results.map(withLegacyFields),
        page: paged.page,
        totalPages: paged.totalPages,
        totalResults: paged.totalResults,
        total_pages: paged.totalPages,
        total_results: paged.totalResults,
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("Movies API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch movies", results: [] },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
