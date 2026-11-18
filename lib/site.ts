/**
 * The site's one public address. Canonical URLs, Open Graph URLs, structured data, the
 * sitemap and robots.txt all use it; next.config.ts keeps its own copy for the redirects
 * (it cannot import app code), so change both if the domain ever changes.
 *
 * It is a constant on purpose. It used to come from the NEXT_PUBLIC_APP_URL build
 * variable, and after the move to streamscapex.app a stale value (the old workers.dev
 * address) tagged every page with a canonical URL that redirects away (found 2026-11-18).
 */
export const SITE_ORIGIN = "https://streamscapex.app";

export const SITE_URL = new URL(SITE_ORIGIN);

/** Absolute URL for a site path ("/movie/..." -> "https://streamscapex.app/movie/..."). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_ORIGIN).toString();
}
