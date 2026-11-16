import { NextResponse, type NextRequest } from "next/server";

import { canonicalGenreHref } from "@/components/catalog/params";

/**
 * Catalog filter URLs have one canonical spelling: known genre ids, at most two, sorted
 * (components/catalog/params.ts). Any other spelling of ?genres= gets a permanent redirect
 * here, before the page renders or calls TMDB.
 *
 * Why: in Nov 2026 a scraper on about 600 IPs requested a different /company/...?genres=
 * URL every time, five genres in random order. Each one was a full, uncached render. Now
 * such a request costs a redirect, and the canonical pages are few enough to repeat.
 */
export function middleware(request: NextRequest) {
  const target = canonicalGenreHref(request.nextUrl.href);
  return target ? NextResponse.redirect(target, 308) : NextResponse.next();
}

// Only the catalog pages read ?genres=; everything else never runs this.
export const config = {
  matcher: ["/movie", "/series", "/browse/:slug", "/company/:slug", "/network/:slug"],
};
