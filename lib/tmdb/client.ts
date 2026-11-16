import "server-only";

/**
 * The only place that talks to api.themoviedb.org.
 *
 * - Server only: the token is read from process.env at call time and never
 *   reaches client bundles (no NEXT_PUBLIC_ value is inlined into client code
 *   because nothing on the client imports this module).
 * - No module-level mutable state (safe on Workers isolates that serve many
 *   requests at once).
 * - 4 s timeout per attempt, one retry on 429/5xx honoring Retry-After.
 */

const BASE_URL = "https://api.themoviedb.org/3";
const DEFAULT_TIMEOUT_MS = 4000;
const MAX_RETRY_WAIT_MS = 2000;

export class TmdbError extends Error {
  readonly status: number;
  readonly tmdbCode?: number;

  constructor(status: number, tmdbCode?: number, message?: string) {
    super(message ?? `TMDB request failed with status ${status}`);
    this.name = "TmdbError";
    this.status = status;
    this.tmdbCode = tmdbCode;
  }
}

/** True for TMDB "not found" (HTTP 404 or status_code 34). Use it to decide notFound(). */
export const isTmdbNotFound = (error: unknown): boolean =>
  error instanceof TmdbError && (error.status === 404 || error.tmdbCode === 34);

export type TmdbParams = Record<string, string | number | boolean | null | undefined>;

/** TMDB_READ_TOKEN, then TMDB_API_KEY, then NEXT_PUBLIC_TMDB_API_KEY (kept until the secret is renamed). */
function resolveToken(): string {
  const candidates = [
    process.env.TMDB_READ_TOKEN,
    process.env.TMDB_API_KEY,
    process.env.NEXT_PUBLIC_TMDB_API_KEY,
  ];
  const token = candidates.find((value) => typeof value === "string" && value.trim() !== "");
  if (!token) throw new TmdbError(500, undefined, "TMDB token is not configured (set TMDB_READ_TOKEN)");
  return token.trim();
}

/** A v3 API key is 32 hex chars and goes in the query string; anything else is a v4 read token. */
const isV3Key = (token: string) => /^[a-f0-9]{32}$/i.test(token);

function buildUrl(path: string, params: TmdbParams, token: string): URL {
  const url = new URL(BASE_URL + (path.startsWith("/") ? path : `/${path}`));
  // Sorted keys keep URLs (and anything keyed on them) stable.
  for (const key of Object.keys(params).sort()) {
    const value = params[key];
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.set(key, String(value));
  }
  if (isV3Key(token)) url.searchParams.set("api_key", token);
  return url;
}

function retryDelayMs(res: Response): number {
  const header = res.headers.get("retry-after");
  const seconds = header ? Number(header) : NaN;
  if (Number.isFinite(seconds) && seconds > 0) return Math.min(seconds * 1000, MAX_RETRY_WAIT_MS);
  return 200 + Math.floor(Math.random() * 300);
}

/**
 * GET a TMDB v3 path ("/movie/550") and return the parsed JSON.
 * `language=en-US` is added unless the caller sets `language` (pass null to omit it).
 * Throws TmdbError on non-2xx (after one retry on 429/5xx), on timeout (status 504)
 * and on network errors (status 502). Thrown errors are never cached by unstable_cache.
 */
export async function tmdbFetch<T>(
  path: string,
  params: TmdbParams = {},
  timeoutMs: number = DEFAULT_TIMEOUT_MS,
): Promise<T> {
  const token = resolveToken();
  const url = buildUrl(path, { language: "en-US", ...params }, token);
  const headers: HeadersInit = { accept: "application/json" };
  if (!isV3Key(token)) headers.Authorization = `Bearer ${token}`;

  for (let attempt = 0; ; attempt++) {
    let res: Response;
    try {
      // No `cache` option: loaders run inside unstable_cache (which stores the trimmed
      // DTO), and an explicit no-store here would force ISR routes to render dynamically.
      res = await fetch(url, { headers, signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      const timedOut =
        error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
      throw new TmdbError(
        timedOut ? 504 : 502,
        undefined,
        timedOut ? `TMDB request timed out after ${timeoutMs} ms (${path})` : `TMDB request failed (${path})`,
      );
    }

    if (res.ok) return (await res.json()) as T;

    if ((res.status === 429 || res.status >= 500) && attempt === 0) {
      await res.body?.cancel().catch(() => undefined);
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs(res)));
      continue;
    }

    const body = (await res.json().catch(() => ({}))) as { status_code?: number; status_message?: string };
    throw new TmdbError(res.status, body.status_code, body.status_message ?? `TMDB ${res.status} (${path})`);
  }
}

/** Parse a positive integer TMDB id from a number or string, or throw a not-found TmdbError. */
export function assertTmdbId(id: number | string): number {
  const value = typeof id === "number" ? id : /^\d+$/.test(id.trim()) ? Number(id.trim()) : NaN;
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new TmdbError(404, 34, `Invalid TMDB id: ${String(id)}`);
  }
  return value;
}
