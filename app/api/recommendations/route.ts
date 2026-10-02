import { NextRequest, NextResponse } from "next/server";
import { isTmdbNotFound } from "@/lib/tmdb/client";
import { getMovie, getTv } from "@/lib/tmdb/details";
import type { CardDTO, MediaType } from "@/lib/tmdb/types";

/**
 * GET /api/recommendations?seeds=movie:414906,tv:100088&exclude=movie:1,tv:2&limit=40
 *
 * Merges TMDB recommendations (similar as fallback) of up to 5 seed titles,
 * read from the cached getMovie/getTv details (usually 0 TMDB calls). Ranked
 * by how many seeds recommend a title, then popularity (as a percentile among
 * candidates of the same media type); deduped; seeds and
 * `exclude` (up to 200 keys) removed. "series:" is accepted as "tv:".
 *
 * Response: { results: CardDTO[] } (no overview). Public cache headers: the
 * output depends only on the normalized (deduped, sorted) seeds and exclude
 * sets, so equivalent requests give identical bodies. Send seeds and exclude
 * sorted to share browser and edge cache entries.
 */

const MAX_SEEDS = 5;
const MAX_EXCLUDE = 200;
const DEFAULT_LIMIT = 40;
const MAX_LIMIT = 60;
const CACHE_HEADERS = { "Cache-Control": "public, max-age=600, stale-while-revalidate=86400" };
/** When a seed failed transiently, cache the partial answer briefly. */
const PARTIAL_CACHE_HEADERS = { "Cache-Control": "public, max-age=60" };

interface Key {
  type: MediaType;
  id: number;
}

function parseKeys(value: string | null, max: number): Key[] {
  const seen = new Set<string>();
  const keys: Key[] = [];
  for (const part of (value ?? "").split(",")) {
    const m = /^(movie|tv|series):(\d{1,10})$/.exec(part.trim().toLowerCase());
    if (!m) continue;
    const key: Key = { type: m[1] === "movie" ? "movie" : "tv", id: Number(m[2]) };
    const k = `${key.type}:${key.id}`;
    if (key.id <= 0 || seen.has(k)) continue;
    seen.add(k);
    keys.push(key);
    if (keys.length >= max) break;
  }
  return keys.sort((a, b) => a.type.localeCompare(b.type) || a.id - b.id);
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const seeds = parseKeys(params.get("seeds"), MAX_SEEDS);
  if (seeds.length === 0) {
    return NextResponse.json({ error: "seeds must be a comma-separated list like movie:414906,tv:100088", results: [] }, { status: 400 });
  }
  const exclude = new Set(parseKeys(params.get("exclude"), MAX_EXCLUDE).map((k) => `${k.type}:${k.id}`));
  for (const s of seeds) exclude.add(`${s.type}:${s.id}`);
  const limitParam = Number.parseInt(params.get("limit") ?? "", 10);
  const limit = Number.isFinite(limitParam) ? Math.min(MAX_LIMIT, Math.max(1, limitParam)) : DEFAULT_LIMIT;

  const settled = await Promise.allSettled(seeds.map((s) => (s.type === "movie" ? getMovie(s.id) : getTv(s.id))));
  const lists = settled.flatMap((r) => (r.status === "fulfilled" ? [r.value.recommendations] : []));
  const transientFailure = settled.some((r) => r.status === "rejected" && !isTmdbNotFound(r.reason));
  if (lists.length === 0) {
    if (!transientFailure) return NextResponse.json({ results: [] }, { headers: PARTIAL_CACHE_HEADERS }); // every seed is unknown to TMDB
    console.error("Recommendations API: every seed failed", settled.map((r) => (r.status === "rejected" ? String(r.reason) : "ok")));
    return NextResponse.json({ error: "Failed to load recommendations", results: [] }, { status: 502, headers: { "Cache-Control": "no-store" } });
  }

  const merged = new Map<string, { card: CardDTO; count: number; bestRank: number }>();
  for (const list of lists) {
    list.forEach((card, rank) => {
      const key = `${card.mediaType}:${card.id}`;
      if (exclude.has(key)) return;
      const entry = merged.get(key);
      if (entry) {
        entry.count += 1;
        entry.bestRank = Math.min(entry.bestRank, rank);
      } else {
        merged.set(key, { card, count: 1, bestRank: rank });
      }
    });
  }

  // TMDB popularity runs on a much larger scale for TV than for movies, so it is
  // compared as a percentile among candidates of the same media type (mixed
  // movie and TV seeds then interleave instead of TV filling the top).
  const percentile = new Map<string, number>();
  for (const type of ["movie", "tv"] as const) {
    const ofType = [...merged.values()].filter((e) => e.card.mediaType === type).sort((a, b) => (b.card.popularity ?? 0) - (a.card.popularity ?? 0));
    ofType.forEach((e, i) => percentile.set(`${type}:${e.card.id}`, 1 - i / ofType.length));
  }
  const relPopularity = (card: CardDTO) => percentile.get(`${card.mediaType}:${card.id}`) ?? 0;

  const results = [...merged.values()]
    .sort(
      (a, b) =>
        b.count - a.count ||
        relPopularity(b.card) - relPopularity(a.card) ||
        a.bestRank - b.bestRank ||
        a.card.mediaType.localeCompare(b.card.mediaType) ||
        a.card.id - b.card.id,
    )
    .slice(0, limit)
    .map(({ card }) => {
      const { overview: _overview, ...rest } = card;
      return rest;
    });

  return NextResponse.json({ results }, { headers: transientFailure ? PARTIAL_CACHE_HEADERS : CACHE_HEADERS });
}
