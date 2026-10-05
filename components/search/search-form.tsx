import { CaretDownIcon, MagnifyingGlassIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { formatRating } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  MAX_QUERY_LENGTH,
  filtersApply,
  ratingOptions,
  searchHref,
  yearOptions,
  type SearchState,
} from "./params";
import { SearchFormShell } from "./search-form-shell";

const INPUT_ID = "search-q";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** A native select drawn as a pill. Native keeps it working without JavaScript and gives phones their own picker. */
function PillSelect({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue: string | number;
  children: ReactNode;
}) {
  return (
    <span className="relative inline-flex">
      <select
        name={name}
        aria-label={label}
        defaultValue={defaultValue}
        className={cn(
          "h-11 appearance-none rounded-full border border-input bg-card bg-none py-0 pl-4 pr-10 text-base text-foreground transition-colors duration-150 ease-out hover:bg-accent md:text-sm",
          focusRing,
        )}
      >
        {children}
      </select>
      <CaretDownIcon
        size={16}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
    </span>
  );
}

/**
 * Search field plus the year and rating filters, as one GET form to /search.
 * The current tab is carried as a hidden field. Filters are not offered on
 * the People tab (people have no year or rating); their values are kept in
 * hidden fields so switching tabs does not lose them.
 *
 * The fields are uncontrolled, so the form is keyed by the URL state: it
 * starts fresh whenever the URL changes (back/forward, a tab link, "Clear
 * filters") instead of keeping stale text.
 */
export function SearchForm({ state }: { state: SearchState }) {
  const showFilters = filtersApply(state.type);
  const years = yearOptions(new Date().getUTCFullYear(), state.year);
  const ratings = ratingOptions(state.minRating);
  const filtered = state.year !== null || state.minRating !== null;

  return (
    <SearchFormShell key={searchHref(state)} className="mt-5 md:mt-6">
      {state.type !== "all" ? <input type="hidden" name="type" value={state.type} /> : null}
      {!showFilters && state.year !== null ? <input type="hidden" name="year" value={state.year} /> : null}
      {!showFilters && state.minRating !== null ? (
        <input type="hidden" name="minRating" value={state.minRating} />
      ) : null}

      <div className="relative">
        <label htmlFor={INPUT_ID} className="sr-only">
          Search
        </label>
        <MagnifyingGlassIcon
          size={22}
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-subtle-foreground"
        />
        <input
          id={INPUT_ID}
          name="q"
          type="search"
          defaultValue={state.q}
          placeholder="Search movies, series and people"
          autoComplete="off"
          autoCapitalize="off"
          enterKeyHint="search"
          maxLength={MAX_QUERY_LENGTH}
          autoFocus={state.q === ""}
          className={cn(
            "h-14 w-full rounded-full border border-input bg-card pl-14 pr-32 text-base text-foreground transition-colors duration-150 ease-out placeholder:text-subtle-foreground md:text-lg",
            focusRing,
          )}
        />
        <button
          type="submit"
          className={cn(
            "absolute right-1.5 top-1.5 inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[transform,background-color] duration-150 ease-out hover:bg-primary-hover active:scale-[0.98]",
            focusRing,
          )}
        >
          Search
        </button>
      </div>

      {showFilters ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <PillSelect name="year" label="Release year" defaultValue={state.year ?? ""}>
            <option value="">Any year</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </PillSelect>
          <PillSelect name="minRating" label="Minimum rating" defaultValue={state.minRating ?? ""}>
            <option value="">Any rating</option>
            {ratings.map((rating) => (
              <option key={rating} value={rating}>
                {formatRating(rating)} and up
              </option>
            ))}
          </PillSelect>
          <Button type="submit" variant="secondary">
            Apply filters
          </Button>
          {filtered ? (
            <Link
              href={searchHref({ q: state.q, type: state.type })}
              prefetch={false}
              className={cn(
                "inline-flex h-11 items-center gap-1.5 rounded-full px-3 text-sm text-muted-foreground transition-colors duration-150 ease-out hover:text-foreground",
                focusRing,
              )}
            >
              <XIcon size={16} aria-hidden="true" />
              Clear filters
            </Link>
          ) : null}
        </div>
      ) : null}
    </SearchFormShell>
  );
}
