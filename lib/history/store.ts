/**
 * Local-first watch history (spec 8.3).
 *
 * A zustand `persist` store in localStorage under "ssx-history-v1". It works
 * without an account: one entry per title, newest first, at most 50 entries.
 * Series entries keep the most recently recorded season/episode.
 *
 * Hydration: localStorage is read synchronously when the module loads in the
 * browser, but zustand serves `getInitialState()` (empty, `hydrated: false`)
 * as the server snapshot. So the SSR pass and the hydration pass both render
 * the empty state (no hydration mismatch) and React re-renders right after
 * hydration with the stored entries and `hydrated: true`.
 *
 * Every write keeps `<html data-history="1">` in sync so the CSS that reserves
 * the Continue watching slot matches what is stored (the inline script in
 * app/layout.tsx sets it before first paint).
 */
import { create } from "zustand";
import { createJSONStorage, persist, type StateStorage } from "zustand/middleware";

export const HISTORY_STORAGE_KEY = "ssx-history-v1";
export const HISTORY_MAX_ENTRIES = 50;
const HISTORY_ATTRIBUTE = "data-history";

export type LocalHistoryMediaType = "movie" | "tv";

export interface LocalHistoryEntry {
  tmdbId: number;
  mediaType: LocalHistoryMediaType;
  title: string;
  posterPath: string | null;
  backdropPath: string | null;
  season?: number;
  episode?: number;
  /** ISO 8601 timestamp of the latest view. */
  watchedAt: string;
}

export interface RecordViewInput {
  tmdbId: number;
  /** "series" is accepted and stored as "tv". */
  mediaType: LocalHistoryMediaType | "series";
  title: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  season?: number | null;
  episode?: number | null;
  /** Defaults to now. */
  watchedAt?: string;
}

export interface LocalHistoryState {
  entries: LocalHistoryEntry[];
  /** False during SSR and the hydration render, true afterwards. */
  hydrated: boolean;
}

const toMediaType = (type: RecordViewInput["mediaType"]): LocalHistoryMediaType =>
  type === "movie" ? "movie" : "tv";

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

const entryKey = (tmdbId: number, mediaType: LocalHistoryMediaType) => `${mediaType}:${tmdbId}`;

/** Never throws: blocked storage, private mode and quota errors are ignored. */
const safeLocalStorage: StateStorage = {
  getItem: (name) => {
    try {
      return window.localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name, value) => {
    try {
      window.localStorage.setItem(name, value);
    } catch {
      // Storage full or unavailable: keep the in-memory state.
    }
  },
  removeItem: (name) => {
    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore.
    }
  },
};

/** Drops malformed entries from storage, dedupes, sorts and caps the list. */
function sanitizeEntries(value: unknown): LocalHistoryEntry[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  const result: LocalHistoryEntry[] = [];
  const valid = value
    .filter(
      (raw): raw is LocalHistoryEntry =>
        !!raw &&
        typeof raw === "object" &&
        isFiniteNumber((raw as LocalHistoryEntry).tmdbId) &&
        ((raw as LocalHistoryEntry).mediaType === "movie" ||
          (raw as LocalHistoryEntry).mediaType === "tv") &&
        typeof (raw as LocalHistoryEntry).title === "string" &&
        typeof (raw as LocalHistoryEntry).watchedAt === "string" &&
        !Number.isNaN(Date.parse((raw as LocalHistoryEntry).watchedAt)),
    )
    .sort((a, b) => Date.parse(b.watchedAt) - Date.parse(a.watchedAt));

  for (const raw of valid) {
    const key = entryKey(raw.tmdbId, raw.mediaType);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push({
      tmdbId: raw.tmdbId,
      mediaType: raw.mediaType,
      title: raw.title,
      posterPath: typeof raw.posterPath === "string" ? raw.posterPath : null,
      backdropPath: typeof raw.backdropPath === "string" ? raw.backdropPath : null,
      ...(isFiniteNumber(raw.season) ? { season: raw.season } : {}),
      ...(isFiniteNumber(raw.episode) ? { episode: raw.episode } : {}),
      watchedAt: raw.watchedAt,
    });
    if (result.length >= HISTORY_MAX_ENTRIES) break;
  }
  return result;
}

function syncHistoryAttribute(entries: LocalHistoryEntry[]) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (entries.length > 0) {
    if (root.getAttribute(HISTORY_ATTRIBUTE) !== "1") root.setAttribute(HISTORY_ATTRIBUTE, "1");
  } else if (root.hasAttribute(HISTORY_ATTRIBUTE)) {
    root.removeAttribute(HISTORY_ATTRIBUTE);
  }
}

const useLocalHistoryStore = create<LocalHistoryState>()(
  persist(
    (): LocalHistoryState => ({
      entries: [],
      hydrated: false,
    }),
    {
      name: HISTORY_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => safeLocalStorage),
      partialize: (state) => ({ entries: state.entries }),
      merge: (persisted, current) => ({
        ...current,
        entries: sanitizeEntries((persisted as Partial<LocalHistoryState> | undefined)?.entries),
        hydrated: true,
      }),
    },
  ),
);

if (typeof window !== "undefined") {
  // Reconcile the attribute the inline head script set with what was loaded.
  syncHistoryAttribute(useLocalHistoryStore.getState().entries);

  // Keep the attribute in sync on every change, including cross-tab updates.
  useLocalHistoryStore.subscribe((state, previous) => {
    if (state.entries !== previous.entries) syncHistoryAttribute(state.entries);
  });

  // Another tab wrote history: reload it so both tabs agree.
  window.addEventListener("storage", (event) => {
    if (event.key === HISTORY_STORAGE_KEY || event.key === null) {
      void useLocalHistoryStore.persist.rehydrate();
    }
  });
}

/**
 * Subscribe to the local history store. The selector must return a stable
 * value (a field, a primitive, or something memoized), as with any zustand
 * selector.
 *
 * Example: `const entries = useLocalHistory((s) => s.entries)`.
 */
export function useLocalHistory<T>(selector: (state: LocalHistoryState) => T): T {
  return useLocalHistoryStore(selector);
}

const selectHydrated = (state: LocalHistoryState) => state.hydrated;

/** False on the server and during the hydration render; true afterwards. */
export function useLocalHistoryHydrated(): boolean {
  return useLocalHistoryStore(selectHydrated);
}

/**
 * Record a view: moves the title to the front with a fresh timestamp. For
 * series, a missing season/episode keeps the previously stored one. Never
 * throws.
 */
export function recordView(input: RecordViewInput): void {
  if (!isFiniteNumber(input.tmdbId) || input.tmdbId <= 0 || !input.title) return;
  const mediaType = toMediaType(input.mediaType);
  const key = entryKey(input.tmdbId, mediaType);
  const watchedAt =
    input.watchedAt && !Number.isNaN(Date.parse(input.watchedAt))
      ? input.watchedAt
      : new Date().toISOString();

  try {
    useLocalHistoryStore.setState((state) => {
      const previous = state.entries.find((e) => entryKey(e.tmdbId, e.mediaType) === key);
      const season = isFiniteNumber(input.season) ? input.season : undefined;
      const episode = isFiniteNumber(input.episode) ? input.episode : undefined;
      const hasEpisode = mediaType === "tv" && season !== undefined;

      const next: LocalHistoryEntry = {
        tmdbId: input.tmdbId,
        mediaType,
        title: input.title,
        posterPath: input.posterPath ?? previous?.posterPath ?? null,
        backdropPath: input.backdropPath ?? previous?.backdropPath ?? null,
        watchedAt,
      };
      if (mediaType === "tv") {
        const keepSeason = hasEpisode ? season : previous?.season;
        const keepEpisode = hasEpisode ? episode : previous?.episode;
        if (keepSeason !== undefined) next.season = keepSeason;
        if (keepEpisode !== undefined) next.episode = keepEpisode;
      }

      const rest = state.entries.filter((e) => entryKey(e.tmdbId, e.mediaType) !== key);
      return { entries: [next, ...rest].slice(0, HISTORY_MAX_ENTRIES) };
    });
  } catch (error) {
    console.warn("[history] Could not record view", error);
  }
}

/** Remove one title from local history. Accepts "series" as "tv". */
export function removeHistoryEntry(
  tmdbId: number,
  mediaType: RecordViewInput["mediaType"],
): void {
  const key = entryKey(tmdbId, toMediaType(mediaType));
  try {
    useLocalHistoryStore.setState((state) => {
      const entries = state.entries.filter((e) => entryKey(e.tmdbId, e.mediaType) !== key);
      return entries.length === state.entries.length ? state : { entries };
    });
  } catch (error) {
    console.warn("[history] Could not remove entry", error);
  }
}

/** Remove every local entry (and the data-history attribute). */
export function clearLocalHistory(): void {
  try {
    useLocalHistoryStore.setState({ entries: [] });
  } catch (error) {
    console.warn("[history] Could not clear history", error);
  }
}

/** Current entries, newest first. Safe to call outside React. */
export function getLocalHistorySnapshot(): LocalHistoryEntry[] {
  return useLocalHistoryStore.getState().entries;
}

/** Re-read localStorage (e.g. after another tab changed it). */
export function rehydrateLocalHistory(): void {
  void useLocalHistoryStore.persist.rehydrate();
}

/** Subscribe outside React. Returns the unsubscribe function. */
export function subscribeLocalHistory(
  listener: (entries: LocalHistoryEntry[]) => void,
): () => void {
  return useLocalHistoryStore.subscribe((state, previous) => {
    if (state.entries !== previous.entries) listener(state.entries);
  });
}
