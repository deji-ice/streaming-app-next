"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as Dialog from "@radix-ui/react-dialog";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  CaretRightIcon,
  ClockCounterClockwiseIcon,
  FilmSlateIcon,
  MagnifyingGlassIcon,
  StarIcon,
  TelevisionIcon,
  WarningCircleIcon,
  XIcon,
} from "@phosphor-icons/react";
import { useDebounce } from "@/hooks/useDebounce";
import { mediaHref, personHref } from "@/lib/slug";
import { tmdbImage } from "@/lib/tmdb-image";

/* -------------------------------------------------------------------------- */
/* Types and data shaping                                                     */
/* -------------------------------------------------------------------------- */

export interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type ResultKind = "movie" | "tv" | "person";
type FilterTab = "all" | ResultKind;

interface SearchResult {
  key: string;
  kind: ResultKind;
  id: number;
  title: string;
  imagePath: string | null;
  year: string | null;
  rating: number | null;
  department: string | null;
  knownFor: string | null;
  href: string;
}

/**
 * Defensive view of a /api/search item. Accepts both the raw TMDB search/multi
 * shape (snake_case) and the data layer DTOs (CardDTO / PersonCardDTO, camelCase).
 */
interface RawSearchItem {
  id?: number | string;
  media_type?: string;
  mediaType?: string;
  title?: string | null;
  name?: string | null;
  poster_path?: string | null;
  posterPath?: string | null;
  profile_path?: string | null;
  profilePath?: string | null;
  release_date?: string | null;
  first_air_date?: string | null;
  releaseDate?: string | null;
  year?: number | string | null;
  vote_average?: number | null;
  rating?: number | null;
  known_for_department?: string | null;
  knownForDepartment?: string | null;
  known_for?: Array<{ title?: string; name?: string } | string> | null;
  knownFor?: Array<{ title?: string; name?: string } | string> | null;
}

interface RawSearchResponse {
  results?: RawSearchItem[];
  people?: RawSearchItem[];
}

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;
const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 300;

const TABS: ReadonlyArray<{ value: FilterTab; label: string }> = [
  { value: "all", label: "All" },
  { value: "movie", label: "Movies" },
  { value: "tv", label: "Series" },
  { value: "person", label: "People" },
];

function inferKind(item: RawSearchItem): ResultKind | null {
  const type = item.media_type ?? item.mediaType;
  if (type === "movie" || type === "tv" || type === "person") return type;
  if (type === "series") return "tv";
  if (type) return null;
  if (
    item.known_for_department ||
    item.knownForDepartment ||
    "profile_path" in item ||
    "profilePath" in item
  ) {
    return "person";
  }
  if (item.first_air_date || (item.name && !item.title)) return "tv";
  if (item.title) return "movie";
  return null;
}

function firstKnownFor(item: RawSearchItem): string | null {
  const list = item.knownFor ?? item.known_for;
  if (!Array.isArray(list)) return null;
  for (const credit of list) {
    const value = (
      typeof credit === "string" ? credit : (credit?.title ?? credit?.name)
    )?.trim();
    if (value) return value;
  }
  return null;
}

function yearOf(item: RawSearchItem, kind: ResultKind): string | null {
  if (typeof item.year === "number" && item.year > 0) return String(item.year);
  if (typeof item.year === "string" && /^\d{4}$/.test(item.year)) return item.year;
  const date =
    (kind === "movie" ? item.release_date : item.first_air_date) ??
    item.releaseDate;
  // Slice the ISO string instead of new Date() so the year never shifts by timezone.
  return date && /^\d{4}/.test(date) ? date.slice(0, 4) : null;
}

function toResult(item: RawSearchItem): SearchResult | null {
  const kind = inferKind(item);
  if (!kind) return null;
  const id = Number(item.id);
  if (!Number.isFinite(id) || id <= 0) return null;
  const title = (
    kind === "movie" ? (item.title ?? item.name) : (item.name ?? item.title)
  )?.trim();
  if (!title) return null;

  if (kind === "person") {
    return {
      key: `person-${id}`,
      kind,
      id,
      title,
      imagePath: item.profile_path ?? item.profilePath ?? null,
      year: null,
      rating: null,
      department:
        (item.known_for_department ?? item.knownForDepartment)?.trim() || null,
      knownFor: firstKnownFor(item),
      href: personHref(id, title),
    };
  }

  const score = item.vote_average ?? item.rating;
  return {
    key: `${kind}-${id}`,
    kind,
    id,
    title,
    imagePath: item.poster_path ?? item.posterPath ?? null,
    year: yearOf(item, kind),
    rating: typeof score === "number" && score > 0 ? score : null,
    department: null,
    knownFor: null,
    href: mediaHref(kind, id, title),
  };
}

async function fetchSearch(
  query: string,
  signal: AbortSignal,
): Promise<SearchResult[]> {
  const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
    signal,
  });
  if (!res.ok) throw new Error(`Search failed with status ${res.status}`);
  const data = (await res.json()) as RawSearchResponse;

  const raw: RawSearchItem[] = [
    ...(Array.isArray(data?.results) ? data.results : []),
    ...(Array.isArray(data?.people)
      ? data.people.map((person) => ({ mediaType: "person", ...person }))
      : []),
  ];

  const seen = new Set<string>();
  const results: SearchResult[] = [];
  for (const item of raw) {
    const result = item ? toResult(item) : null;
    if (!result || seen.has(result.key)) continue;
    seen.add(result.key);
    results.push(result);
  }
  return results;
}

function readRecentSearches(): string[] {
  try {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed)
      ? parsed
          .filter((term): term is string => typeof term === "string")
          .slice(0, MAX_RECENT_SEARCHES)
      : [];
  } catch {
    return [];
  }
}

function writeRecentSearches(terms: string[]) {
  try {
    if (terms.length) {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(terms));
    } else {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  } catch {
    // Storage unavailable: recent searches just are not persisted.
  }
}

function isPlainLeftClick(event: ReactMouseEvent) {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

type SearchOption =
  | { id: string; type: "result"; result: SearchResult }
  | { id: string; type: "see-all"; href: string }
  | { id: string; type: "recent"; term: string };

/* -------------------------------------------------------------------------- */
/* Component                                                                  */
/* -------------------------------------------------------------------------- */

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover";

/**
 * Global search dialog. Loaded with next/dynamic by Navbar and mounted only
 * after the first open. Radix Dialog provides the portal, focus trap, Esc,
 * outside click and scroll lock. Results come from /api/search (one request
 * per debounced query, aborted when superseded); the tabs filter client side.
 */
export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const inputRef = useRef<HTMLInputElement>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<FilterTab>("all");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>(readRecentSearches);

  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, DEBOUNCE_MS);
  const hasQuery = trimmed.length >= MIN_QUERY_LENGTH;
  const enabled = debounced.length >= MIN_QUERY_LENGTH;

  const { data, isFetching, isError, isPlaceholderData, refetch } = useQuery({
    queryKey: ["search-modal", debounced.toLowerCase()],
    // React Query owns the AbortController: a superseded query is aborted.
    queryFn: ({ signal }) => fetchSearch(debounced, signal),
    enabled,
    placeholderData: keepPreviousData,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  const results = useMemo(
    () => (hasQuery && data ? data : []),
    [hasQuery, data],
  );

  const counts = useMemo(() => {
    const next: Record<FilterTab, number> = {
      all: results.length,
      movie: 0,
      tv: 0,
      person: 0,
    };
    for (const result of results) next[result.kind] += 1;
    return next;
  }, [results]);

  const filtered = useMemo(
    () =>
      tab === "all" ? results : results.filter((result) => result.kind === tab),
    [results, tab],
  );

  const seeAllHref = `/search?q=${encodeURIComponent(trimmed)}`;
  const mode: "recent" | "hint" | "results" =
    trimmed.length === 0 ? "recent" : hasQuery ? "results" : "hint";
  const waitingForFirstResults =
    mode === "results" &&
    (!data || trimmed !== debounced || isPlaceholderData) &&
    !isError;
  const showSkeleton = mode === "results" && !data && !isError;

  const options = useMemo<SearchOption[]>(() => {
    if (mode === "recent") {
      return recent.map((term, index) => ({
        id: `${baseId}-recent-${index}`,
        type: "recent" as const,
        term,
      }));
    }
    if (mode !== "results" || !data) return [];
    const list: SearchOption[] = filtered.map((result) => ({
      id: `${baseId}-${result.key}`,
      type: "result" as const,
      result,
    }));
    if (results.length > 0) {
      list.push({ id: `${baseId}-see-all`, type: "see-all", href: seeAllHref });
    }
    return list;
  }, [mode, recent, data, filtered, results.length, seeAllHref, baseId]);

  const activeIndex = activeId
    ? options.findIndex((option) => option.id === activeId)
    : -1;
  const activeOptionId = activeIndex >= 0 ? options[activeIndex].id : undefined;

  // Keep the active row visible while arrowing through a long list.
  useEffect(() => {
    if (!activeOptionId) return;
    document
      .getElementById(activeOptionId)
      ?.scrollIntoView({ block: "nearest" });
  }, [activeOptionId]);

  const saveRecentSearch = useCallback((term: string) => {
    const value = term.trim();
    if (value.length < MIN_QUERY_LENGTH) return;
    setRecent((prev) => {
      const next = [
        value,
        ...prev.filter((item) => item.toLowerCase() !== value.toLowerCase()),
      ].slice(0, MAX_RECENT_SEARCHES);
      writeRecentSearches(next);
      return next;
    });
  }, []);

  const clearRecentSearches = () => {
    setRecent([]);
    setActiveId(null);
    writeRecentSearches([]);
    inputRef.current?.focus();
  };

  const applyTerm = (term: string) => {
    setQuery(term);
    setActiveId(null);
    inputRef.current?.focus();
  };

  const navigate = (href: string) => {
    saveRecentSearch(trimmed);
    onOpenChange(false);
    router.push(href);
  };

  const activate = (option: SearchOption) => {
    if (option.type === "recent") applyTerm(option.term);
    else if (option.type === "see-all") navigate(option.href);
    else navigate(option.result.href);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (activeIndex >= 0) {
      activate(options[activeIndex]);
    } else if (hasQuery) {
      navigate(seeAllHref);
    }
  };

  const handleInputKeyDown = (event: ReactKeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    if (options.length === 0) return;
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    const nextIndex =
      activeIndex === -1
        ? step === 1
          ? 0
          : options.length - 1
        : (activeIndex + step + options.length) % options.length;
    setActiveId(options[nextIndex].id);
  };

  const handleLinkClick = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    saveRecentSearch(trimmed);
    // Let modified clicks (new tab or window) keep the dialog open.
    if (isPlainLeftClick(event)) onOpenChange(false);
  };

  const selectTab = (value: FilterTab) => {
    setTab(value);
    setActiveId(null);
  };

  const statusMessage = (() => {
    if (mode !== "results" || waitingForFirstResults || isFetching) return "";
    if (isError) return "Search failed.";
    if (filtered.length === 0) return `No results for ${trimmed}.`;
    return `${filtered.length} ${filtered.length === 1 ? "result" : "results"}.`;
  })();

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-overlay bg-black/70 [animation-duration:220ms] ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0" />
        <Dialog.Content
          data-search-dialog=""
          aria-describedby={undefined}
          onOpenAutoFocus={(event) => {
            // Focus has not moved yet: remember where to return it on close.
            returnFocusRef.current =
              document.activeElement instanceof HTMLElement
                ? document.activeElement
                : null;
            event.preventDefault();
            inputRef.current?.focus();
            inputRef.current?.select();
          }}
          onCloseAutoFocus={(event) => {
            const target = returnFocusRef.current;
            if (target && target.isConnected && target !== document.body) {
              event.preventDefault();
              target.focus({ preventScroll: true });
            }
          }}
          className="fixed inset-0 z-overlay flex h-[100dvh] flex-col bg-popover text-popover-foreground outline-none [animation-duration:220ms] ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:slide-in-from-bottom-2 data-[state=closed]:slide-out-to-bottom-2 md:inset-x-0 md:bottom-auto md:top-[12vh] md:mx-auto md:h-auto md:max-h-[min(76vh,680px)] md:w-full md:max-w-[640px] md:rounded-panel md:border md:border-border md:data-[state=open]:slide-in-from-bottom-0 md:data-[state=closed]:slide-out-to-bottom-0 md:data-[state=open]:zoom-in-[0.98] md:data-[state=closed]:zoom-out-[0.98]"
        >
          <Dialog.Title className="sr-only">Search</Dialog.Title>

          {/* Input row */}
          <form
            role="search"
            onSubmit={handleSubmit}
            className="flex shrink-0 items-center gap-2 border-b border-border px-3 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] md:p-4"
          >
            <div className="relative min-w-0 flex-1">
              <MagnifyingGlassIcon
                size={20}
                aria-hidden="true"
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-subtle-foreground"
              />
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-label="Search movies, series and people"
                aria-expanded={options.length > 0}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-autocomplete="list"
                placeholder="Search movies, series and people"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveId(null);
                }}
                onKeyDown={handleInputKeyDown}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
                className="h-12 w-full rounded-full border border-input bg-card pl-11 pr-12 text-base text-foreground placeholder:text-subtle-foreground focus:border-input focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-0"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => applyTerm("")}
                  className={`absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:text-foreground ${FOCUS_RING}`}
                >
                  <XIcon size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close search"
                className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground hover:bg-accent md:hidden ${FOCUS_RING}`}
              >
                <XIcon size={24} aria-hidden="true" />
              </button>
            </Dialog.Close>
          </form>

          {/* Filter tabs */}
          <div
            role="group"
            aria-label="Filter results"
            className="relative flex shrink-0 gap-2 overflow-x-auto border-b border-border px-3 py-2.5 [scrollbar-width:none] md:px-4 [&::-webkit-scrollbar]:hidden"
          >
            {TABS.map(({ value, label }) => {
              const selected = tab === value;
              const count = hasQuery && data ? counts[value] : null;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => selectTab(value)}
                  className={`inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.98] md:h-8 md:px-3 ${FOCUS_RING} ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                  {count !== null && (
                    <span
                      className={`tabular-nums ${selected ? "" : "text-subtle-foreground"}`}
                    >
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-2 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:pb-2">
            <p role="status" aria-live="polite" className="sr-only">
              {statusMessage}
            </p>

            {mode === "recent" && recent.length > 0 && (
              <div className="flex items-center justify-between gap-3 px-3 pb-1 pt-1">
                <h3 className="text-[13px] font-semibold text-muted-foreground">
                  Recent searches
                </h3>
                <button
                  type="button"
                  onClick={clearRecentSearches}
                  className={`-mr-2 inline-flex h-11 items-center rounded-full px-3 text-[13px] font-medium text-muted-foreground hover:bg-accent hover:text-foreground md:h-8 ${FOCUS_RING}`}
                >
                  Clear
                </button>
              </div>
            )}

            {mode === "recent" && recent.length === 0 && (
              <p className="px-3 py-4 text-sm text-subtle-foreground">
                Search movies, series and people by name.
              </p>
            )}

            {mode === "hint" && (
              <p className="px-3 py-4 text-sm text-subtle-foreground">
                Type at least {MIN_QUERY_LENGTH} characters to search.
              </p>
            )}

            {showSkeleton && <ResultSkeleton />}

            {mode === "results" && isError && !data && (
              <div className="flex items-start gap-3 px-3 py-4">
                <WarningCircleIcon
                  size={20}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-subtle-foreground"
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    Search is unavailable right now.
                  </p>
                  <button
                    type="button"
                    onClick={() => void refetch()}
                    className={`mt-2 inline-flex h-11 items-center rounded-full border border-border bg-card px-4 text-sm font-medium text-foreground hover:bg-accent md:h-9 ${FOCUS_RING}`}
                  >
                    Try again
                  </button>
                </div>
              </div>
            )}

            {mode === "results" &&
              data &&
              !waitingForFirstResults &&
              filtered.length === 0 && (
                <div className="flex items-start gap-3 px-3 py-4">
                  <MagnifyingGlassIcon
                    size={40}
                    weight="duotone"
                    aria-hidden="true"
                    className="shrink-0 text-subtle-foreground"
                  />
                  <div className="min-w-0">
                    <p className="text-[18px] font-semibold text-foreground">
                      {results.length === 0
                        ? `No results for “${trimmed}”`
                        : `No ${TABS.find((t) => t.value === tab)?.label.toLowerCase()} for “${trimmed}”`}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {results.length === 0
                        ? "Check the spelling or try a different title or name."
                        : "Switch to All to see the other results."}
                    </p>
                  </div>
                </div>
              )}

            <div
              role="listbox"
              id={listboxId}
              aria-label={mode === "recent" ? "Recent searches" : "Search results"}
              aria-busy={mode === "results" && isFetching && isPlaceholderData}
              className="flex flex-col gap-0.5"
            >
              {options.map((option) => {
                const active = option.id === activeOptionId;
                const rowClass = `flex w-full items-center gap-3 rounded-media px-3 text-left outline-none ${
                  active ? "bg-accent" : ""
                }`;
                const onMouseMove = () => {
                  if (!active) setActiveId(option.id);
                };

                if (option.type === "recent") {
                  return (
                    <button
                      key={option.id}
                      id={option.id}
                      type="button"
                      role="option"
                      aria-selected={active}
                      tabIndex={-1}
                      onClick={() => applyTerm(option.term)}
                      onMouseMove={onMouseMove}
                      className={`${rowClass} min-h-11 py-2 text-sm text-foreground`}
                    >
                      <ClockCounterClockwiseIcon
                        size={20}
                        aria-hidden="true"
                        className="shrink-0 text-subtle-foreground"
                      />
                      <span className="min-w-0 flex-1 truncate">
                        {option.term}
                      </span>
                    </button>
                  );
                }

                if (option.type === "see-all") {
                  return (
                    <Link
                      key={option.id}
                      id={option.id}
                      href={option.href}
                      prefetch={false}
                      role="option"
                      aria-selected={active}
                      tabIndex={-1}
                      onClick={handleLinkClick}
                      onMouseMove={onMouseMove}
                      className={`${rowClass} mt-1 min-h-12 border-t border-border py-2 text-sm font-medium text-foreground`}
                    >
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center text-muted-foreground">
                        <MagnifyingGlassIcon size={20} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">
                        See all results for &ldquo;{trimmed}&rdquo;
                      </span>
                      <CaretRightIcon
                        size={16}
                        aria-hidden="true"
                        className="shrink-0 text-subtle-foreground"
                      />
                    </Link>
                  );
                }

                const { result } = option;
                return (
                  <Link
                    key={option.id}
                    id={option.id}
                    href={result.href}
                    prefetch={false}
                    role="option"
                    aria-selected={active}
                    tabIndex={-1}
                    onClick={handleLinkClick}
                    onMouseMove={onMouseMove}
                    className={`${rowClass} py-2`}
                  >
                    <ResultThumb result={result} />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block truncate text-[15px] font-medium ${
                          active ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {result.title}
                      </span>
                      <ResultMeta result={result} />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/* -------------------------------------------------------------------------- */
/* Row parts                                                                  */
/* -------------------------------------------------------------------------- */

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  const first = parts[0]?.charAt(0) ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : "";
  return `${first}${last}`.toUpperCase();
}

function ResultThumb({ result }: { result: SearchResult }) {
  const src = tmdbImage(result.imagePath);

  if (result.kind === "person") {
    return (
      <span className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-muted text-[13px] font-semibold text-muted-foreground">
        {src ? (
          <Image
            src={src}
            alt=""
            width={40}
            height={40}
            className="h-full w-full object-cover object-top"
          />
        ) : (
          <span aria-hidden="true">{initialsOf(result.title)}</span>
        )}
      </span>
    );
  }

  const FallbackIcon = result.kind === "tv" ? TelevisionIcon : FilmSlateIcon;
  return (
    <span className="relative inline-flex h-[60px] w-10 shrink-0 items-center justify-center overflow-hidden rounded-media bg-muted text-subtle-foreground">
      {src ? (
        <Image
          src={src}
          alt=""
          width={40}
          height={60}
          className="h-full w-full object-cover"
        />
      ) : (
        <FallbackIcon size={16} aria-hidden="true" />
      )}
    </span>
  );
}

function ResultMeta({ result }: { result: SearchResult }) {
  if (result.kind === "person") {
    const items = [
      result.department ?? "Person",
      result.knownFor ? `Known for ${result.knownFor}` : null,
    ].filter(Boolean);
    return (
      <span className="mt-0.5 flex min-w-0 gap-x-3 text-[13px] text-subtle-foreground">
        {items.map((item, index) => (
          <span key={index} className={index > 0 ? "min-w-0 truncate" : "shrink-0"}>
            {item}
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[13px] tabular-nums text-subtle-foreground">
      <span>{result.kind === "tv" ? "Series" : "Movie"}</span>
      {result.year && <span>{result.year}</span>}
      {result.rating !== null && (
        <span className="inline-flex items-center gap-1">
          <StarIcon
            size={12}
            weight="fill"
            aria-hidden="true"
            className="text-primary"
          />
          <span>
            <span className="sr-only">Rating </span>
            {result.rating.toFixed(1)}
          </span>
        </span>
      )}
    </span>
  );
}

function ResultSkeleton() {
  return (
    <div aria-hidden="true" className="flex flex-col gap-0.5">
      {Array.from({ length: 5 }, (_, index) => (
        <div key={index} className="flex items-center gap-3 px-3 py-2">
          <span className="h-[60px] w-10 shrink-0 animate-skeleton rounded-media bg-muted" />
          <span className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="h-4 w-2/5 animate-skeleton rounded-full bg-muted" />
            <span className="h-3 w-1/4 animate-skeleton rounded-full bg-muted" />
          </span>
        </div>
      ))}
    </div>
  );
}

export default SearchModal;
