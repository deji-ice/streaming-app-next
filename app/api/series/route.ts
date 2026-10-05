import { NextRequest, NextResponse } from "next/server";
import { withLegacyFields } from "@/lib/tmdb/legacy";
import { clampPage, getTvList, isTvList } from "@/lib/tmdb/lists";

/**
 * GET /api/series?endpoint=popular|top_rated|on_the_air|airing_today&page=1..500
 * ("tv/popular" style values are accepted too). Anything else is a 400:
 * this route used to proxy any TMDB tv path with the app's token.
 *
 * Response: { results: CardDTO rows (+ snake_case aliases), page, totalPages,
 * totalResults, total_pages, total_results }.
 */

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" };

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const endpoint = (params.get("endpoint") ?? "popular").replace(/^\/?tv\//, "");
  if (!isTvList(endpoint)) {
    return NextResponse.json(
      { error: "endpoint must be one of popular, top_rated, on_the_air, airing_today", results: [] },
      { status: 400 },
    );
  }
  const page = clampPage(params.get("page"));

  try {
    const paged = await getTvList(endpoint, page);
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
    console.error("Series API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch series", results: [] },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
