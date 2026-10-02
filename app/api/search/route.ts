import { NextRequest, NextResponse } from "next/server";
import { withLegacyFields, withLegacyPersonFields } from "@/lib/tmdb/legacy";
import { clampPage } from "@/lib/tmdb/lists";
import { normalizeQuery, search, type SearchResultDTO } from "@/lib/tmdb/search";

/**
 * GET /api/search?q=&type=&year=&minRating=&page=
 *
 * - q: at least 2 characters (shorter returns an empty page)
 * - type: "movie" | "tv" (or "series") | "person" (or "people"); anything else searches all three
 * - year: release year (movie) / first-air year (tv); applied by TMDB for typed
 *   searches and as a post-filter on "all"
 * - minRating: 0..10, post-filter on the returned page (TMDB search has no vote filter)
 * - page: 1..500
 *
 * Response: { results, page, totalPages, totalResults, total_pages, total_results }.
 * Each row is a CardDTO ({ id, mediaType: "movie" | "tv", title, posterPath, backdropPath,
 * year, rating, genreIds, releaseDate }) or a PersonCardDTO ({ id, mediaType: "person",
 * title, name, profilePath, knownForDepartment, knownFor }), plus snake_case aliases
 * (media_type, poster_path, profile_path, known_for_department, release_date,
 * first_air_date, vote_average...) for older consumers.
 */

const CACHE_HEADERS = { "Cache-Control": "public, max-age=300, stale-while-revalidate=3600" };

const yearOf = (row: SearchResultDTO) => (row.mediaType === "person" ? null : row.year);

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const rawQuery = params.get("q");
  if (rawQuery === null) {
    return NextResponse.json({ error: "Query parameter q is required" }, { status: 400 });
  }

  const q = normalizeQuery(rawQuery);
  const page = clampPage(params.get("page"));
  const typeParam = params.get("type");
  const type = typeParam === "series" ? "tv" : typeParam === "people" ? "person" : typeParam;
  const yearParam = params.get("year");
  const year = yearParam && /^\d{4}$/.test(yearParam) ? Number(yearParam) : null;
  const minRatingParam = Number.parseFloat(params.get("minRating") ?? "");
  const minRating = Number.isFinite(minRatingParam) && minRatingParam > 0 ? Math.min(minRatingParam, 10) : null;

  if (q.length < 2) {
    return NextResponse.json(
      { results: [], page: 1, totalPages: 0, totalResults: 0, total_pages: 0, total_results: 0 },
      { headers: CACHE_HEADERS },
    );
  }

  try {
    const typed = type === "movie" || type === "tv" || type === "person";
    const paged = await search(q, { type: typed ? type : null, year, page });

    let rows = paged.results;
    // Typed searches already filter by year at TMDB; "all" needs a post-filter.
    if (year !== null && !typed) rows = rows.filter((r) => r.mediaType !== "person" && yearOf(r) === year);
    if (minRating !== null) rows = rows.filter((r) => r.mediaType !== "person" && (r.rating ?? 0) >= minRating);

    const results = rows.map((r) => (r.mediaType === "person" ? withLegacyPersonFields(r) : withLegacyFields(r)));
    return NextResponse.json(
      {
        results,
        page: paged.page,
        totalPages: paged.totalPages,
        totalResults: paged.totalResults,
        total_pages: paged.totalPages,
        total_results: paged.totalResults,
      },
      { headers: CACHE_HEADERS },
    );
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Search failed", results: [], page, totalPages: 0, totalResults: 0, total_pages: 0, total_results: 0 },
      { status: 502, headers: { "Cache-Control": "no-store" } },
    );
  }
}
