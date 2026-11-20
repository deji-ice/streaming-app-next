/**
 * Titles taken down after a copyright (DMCA) notice. Their page stays up with its details,
 * but the player and stream sources are replaced by a notice (UnavailablePlayer), and
 * /api/stream refuses them. If a notice ever names the page itself, call notFound() for
 * these ids in the page loader instead.
 *
 * To take down another title, add its TMDB id (the number at the end of the page URL) to the
 * right list with a note of the report, then deploy. Cloudflare gives 72 hours from the
 * notice email.
 */
const TAKEN_DOWN = {
  movie: new Set<number>([
    791523, // Wildwood. Cloudflare abuse report 58a3146bd7f3ae81, received 2026-11-20.
  ]),
  tv: new Set<number>([]),
};

/** "series" and "tv" are the same list; anything else (people, companies) is never taken down. */
export function isTakenDown(type: string | null | undefined, id: number | string | null | undefined): boolean {
  const list = type === "movie" ? TAKEN_DOWN.movie : type === "tv" || type === "series" ? TAKEN_DOWN.tv : null;
  const numericId = Number(id);
  return list !== null && Number.isInteger(numericId) && list.has(numericId);
}
