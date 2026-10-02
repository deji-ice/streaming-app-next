import { MagnifyingGlassIcon } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import type { ReactNode } from "react";

import { posterGridClass } from "@/components/ds/classes";
import { EmptyState } from "@/components/ds/empty-state";
import { MetaRow } from "@/components/ds/meta-row";
import { PersonCard } from "@/components/ds/person-card";
import { PosterCard } from "@/components/ds/poster-card";
import { Button } from "@/components/ui/button";
import { formatCompact, formatRating } from "@/lib/format";
import { mediaHref, personHref } from "@/lib/slug";
import type { PersonCardDTO } from "@/lib/tmdb/types";

import type { SearchResults } from "./data";
import { SEARCH_TABS, hasFilters, resultNoun, searchHref, type SearchState } from "./params";
import { SearchPagination } from "./search-pagination";

const PEOPLE_GRID =
  "grid grid-cols-2 gap-x-3 gap-y-6 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8";

/** Keeps a very long query from breaking out of a heading. */
const shortQuery = (q: string) => (q.length > 60 ? `${q.slice(0, 57)}...` : q);

/** Known-for titles tell apart people with the same name; the department is the fallback. */
const personRole = (person: PersonCardDTO) =>
  person.knownFor.slice(0, 2).join(", ") || person.knownForDepartment;

function ActionLink({ href, children, variant }: { href: string; children: ReactNode; variant?: "default" | "secondary" }) {
  return (
    <Button asChild variant={variant ?? "secondary"}>
      <Link href={href} prefetch={false}>
        {children}
      </Link>
    </Button>
  );
}

function NoResults({ state, otherTabsHaveResults }: { state: SearchState; otherTabsHaveResults: boolean }) {
  const filtered = hasFilters(state);
  const q = shortQuery(state.q);
  return (
    <EmptyState
      className="mt-8"
      icon={<MagnifyingGlassIcon weight="duotone" />}
      title={`No ${resultNoun(state.type, 0)} for "${q}"`}
      body={
        otherTabsHaveResults
          ? "Try a different spelling or remove filters, or check another tab."
          : "Try a different spelling or remove filters."
      }
      action={
        filtered ? (
          <ActionLink href={searchHref({ q: state.q, type: state.type })}>Clear filters</ActionLink>
        ) : undefined
      }
    />
  );
}

function NoRatingMatches({ state, totalPages }: { state: SearchState; totalPages: number }) {
  const rating = formatRating(state.minRating) ?? "";
  return (
    <EmptyState
      className="mt-8"
      icon={<MagnifyingGlassIcon weight="duotone" />}
      title={`Nothing rated ${rating} or higher on this page`}
      body="The rating filter applies to the titles on the current page. Try the next page or remove the filter."
      action={
        <>
          {state.page < totalPages ? (
            <ActionLink href={searchHref({ ...state, page: state.page + 1 })} variant="default">
              Next page
            </ActionLink>
          ) : null}
          <ActionLink href={searchHref({ ...state, minRating: null, page: 1 })}>Remove rating filter</ActionLink>
        </>
      }
    />
  );
}

function PageOutOfRange({ state, totalPages }: { state: SearchState; totalPages: number }) {
  const last = Math.max(totalPages, 1);
  return (
    <EmptyState
      className="mt-8"
      icon={<MagnifyingGlassIcon weight="duotone" />}
      title="That page does not exist"
      body={`These results have ${last} ${last === 1 ? "page" : "pages"}.`}
      action={
        <ActionLink href={searchHref({ ...state, page: last })} variant="default">
          Go to page {last}
        </ActionLink>
      }
    />
  );
}

/**
 * Results for the current tab: summary line, title grid, people grid and
 * pagination. Server component.
 */
export function SearchResultsView({ state, data }: { state: SearchState; data: SearchResults }) {
  const { titles, people, counts } = data;
  const otherTabsHaveResults = SEARCH_TABS.some(
    (tab) => tab.value !== state.type && (counts[tab.value] ?? 0) > 0,
  );

  if (data.totalResults === 0) {
    return <NoResults state={state} otherTabsHaveResults={otherTabsHaveResults} />;
  }
  if (titles.length + people.length === 0) {
    return data.titlesBeforeRating > 0 ? (
      <NoRatingMatches state={state} totalPages={data.totalPages} />
    ) : (
      <PageOutOfRange state={state} totalPages={data.totalPages} />
    );
  }

  const both = titles.length > 0 && people.length > 0;
  const peopleFirst = both && data.topHitIsPerson;
  const showTypeLabel = state.type === "all";
  const ratingFiltered = state.minRating !== null && state.type !== "person";
  const total = formatCompact(data.totalResults);
  const titlesHeading =
    state.type === "movie" ? "Movies" : state.type === "tv" ? "Series" : "Movies and series";

  const summary = (
    <MetaRow
      className="mt-6"
      items={[
        // Totals ignore the rating filter, so they are left out while it is set.
        !ratingFiltered && total
          ? `${total} ${resultNoun(state.type, data.totalResults)} for "${shortQuery(state.q)}"`
          : null,
        data.totalPages > 1 ? `Page ${state.page} of ${data.totalPages}` : null,
        ratingFiltered
          ? `${titles.length} of ${data.titlesBeforeRating} titles on this page are rated ${formatRating(state.minRating)} or higher`
          : null,
      ]}
    />
  );

  const titlesSection =
    titles.length > 0 ? (
      <section aria-labelledby="search-titles" className={peopleFirst ? "mt-8 md:mt-10" : "mt-6"}>
        <h2 id="search-titles" className={both ? "type-section mb-4 text-foreground" : "sr-only"}>
          {titlesHeading}
        </h2>
        <ul className={posterGridClass}>
          {titles.map((card, index) => (
            <li key={`${card.mediaType}-${card.id}`} className="min-w-0">
              <PosterCard
                width="fill"
                href={mediaHref(card.mediaType, card.id, card.title)}
                title={card.title}
                posterPath={card.posterPath}
                year={card.year}
                rating={card.rating}
                subtitle={showTypeLabel ? (card.mediaType === "tv" ? "Series" : "Movie") : null}
                priority={!peopleFirst && index === 0}
              />
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  const peopleSection =
    people.length > 0 ? (
      <section
        aria-labelledby="search-people"
        className={both && !peopleFirst ? "mt-8 md:mt-10" : "mt-6"}
      >
        <h2 id="search-people" className={both ? "type-section mb-4 text-foreground" : "sr-only"}>
          People
        </h2>
        <ul className={PEOPLE_GRID}>
          {people.map((person) => (
            <li key={person.id} className="flex justify-center">
              <PersonCard
                size="lg"
                href={personHref(person.id, person.name)}
                name={person.name}
                profilePath={person.profilePath}
                role={personRole(person)}
              />
            </li>
          ))}
        </ul>
      </section>
    ) : null;

  return (
    <>
      {summary}
      {peopleFirst ? peopleSection : titlesSection}
      {peopleFirst ? titlesSection : peopleSection}
      <SearchPagination state={state} totalPages={data.totalPages} />
    </>
  );
}
