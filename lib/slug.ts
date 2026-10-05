/**
 * URL helpers. Every internal link to a title, person, company, network or
 * streaming provider is built here so the same entity always gets one URL.
 *
 * Routes keep accepting legacy slugs: the id is always the last "-" segment,
 * whatever comes before it (see parseIdFromSlug).
 *
 * Client-safe: no server-only imports.
 */

/** Media types accepted by mediaHref. TMDB says "tv"; the app route is /series. */
export type SlugMediaType = "movie" | "tv" | "series";

/**
 * Lowercase, strip accents (NFKD + combining marks), turn every run of
 * non-alphanumerics into "-", trim edge hyphens.
 * "Amélie" -> "amelie", "Spider-Man: No Way Home" -> "spider-man-no-way-home".
 * Titles with no Latin letters (for example Japanese) produce "".
 */
export function slugify(input: string | null | undefined): string {
  if (!input) return "";
  return input
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** "{slug}-{id}", or just "{id}" when the name has no sluggable characters. */
export function slugWithId(name: string | null | undefined, id: number | string): string {
  const slug = slugify(name);
  return slug ? `${slug}-${id}` : String(id);
}

/** "movie" stays "movie"; "tv" and "series" both map to the /series route. */
export function routeSegmentFor(type: SlugMediaType): "movie" | "series" {
  return type === "movie" ? "movie" : "series";
}

/** /movie/{slug}-{id} or /series/{slug}-{id} ("tv" maps to series). */
export function mediaHref(
  type: SlugMediaType,
  id: number | string,
  title: string | null | undefined,
): string {
  return `/${routeSegmentFor(type)}/${slugWithId(title, id)}`;
}

/** /person/{slug}-{id} */
export function personHref(id: number | string, name: string | null | undefined): string {
  return `/person/${slugWithId(name, id)}`;
}

/** /company/{slug}-{id} (studio pages, discover with_companies) */
export function companyHref(id: number | string, name: string | null | undefined): string {
  return `/company/${slugWithId(name, id)}`;
}

/** /network/{slug}-{id} (TV network pages, discover with_networks) */
export function networkHref(id: number | string, name: string | null | undefined): string {
  return `/network/${slugWithId(name, id)}`;
}

/** /browse/{slug} for a curated streaming provider (slug comes from the curated list). */
export function providerHref(slug: string): string {
  return `/browse/${slug}`;
}

/**
 * Reads the numeric id from the last "-" segment of a route slug.
 * "the-batman-414906" -> 414906, "414906" -> 414906, "the-batman" -> null.
 * Accepts legacy slugs (any prefix, double hyphens, URL-encoded prefixes).
 */
export function parseIdFromSlug(slug: string | null | undefined): number | null {
  if (!slug) return null;
  const last = slug.split("-").pop()?.trim() ?? "";
  if (!/^\d+$/.test(last)) return null;
  const id = Number(last);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}
