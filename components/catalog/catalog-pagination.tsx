import { CaretLeftIcon, CaretRightIcon } from "@phosphor-icons/react/dist/ssr";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "@/components/ui/pagination";

import { catalogHref, MAX_PAGE, pageWindow, type CatalogQuery } from "./params";

export interface CatalogPaginationProps {
  page: number;
  totalPages: number;
  /** Path of the page, for example /movie. */
  basePath: string;
  /** Every other param the page keeps (sort, genres, type). */
  query: CatalogQuery;
  className?: string;
}

const edgeLink = "gap-1.5 border border-border bg-card px-4 hover:bg-accent";

/**
 * Real links, so paging works without JavaScript and every page has a URL.
 * Below md: Prev, "Page x of y", Next. From md: Prev, a 7-slot window of page
 * numbers, Next. Never more than 500 pages (TMDB's limit). The numbers are
 * the same list items hidden below md, so no link is rendered twice.
 */
export function CatalogPagination({ page, totalPages, basePath, query, className }: CatalogPaginationProps) {
  const total = Math.min(Math.max(Math.trunc(totalPages), 0), MAX_PAGE);
  if (total <= 1) return null;

  const current = Math.min(Math.max(page, 1), total);
  const hrefFor = (target: number) => catalogHref(basePath, { ...query, page: target > 1 ? target : undefined });
  const hasPrev = current > 1;
  const hasNext = current < total;

  return (
    <Pagination className={className}>
      <PaginationContent className="justify-center gap-1 md:gap-2">
        <PaginationItem>
          <PaginationLink
            href={hrefFor(current - 1)}
            disabled={!hasPrev}
            size="default"
            prefetch={false}
            rel={hasPrev ? "prev" : undefined}
            aria-label={hasPrev ? "Previous page" : undefined}
            className={edgeLink}
          >
            <CaretLeftIcon size={20} aria-hidden="true" />
            <span className="md:hidden">Prev</span>
            <span className="hidden md:inline">Previous</span>
          </PaginationLink>
        </PaginationItem>

        <PaginationItem className="md:hidden">
          <span className="inline-flex h-11 items-center px-2 text-sm tabular-nums text-muted-foreground">
            Page {current} of {total}
          </span>
        </PaginationItem>

        {pageWindow(current, total).map((slot) =>
          typeof slot === "number" ? (
            <PaginationItem key={slot} className="hidden md:block">
              <PaginationLink
                href={hrefFor(slot)}
                isActive={slot === current}
                prefetch={false}
                aria-label={`Page ${slot}`}
              >
                {slot}
              </PaginationLink>
            </PaginationItem>
          ) : (
            <PaginationItem key={slot} className="hidden md:block">
              <PaginationEllipsis />
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationLink
            href={hrefFor(current + 1)}
            disabled={!hasNext}
            size="default"
            prefetch={false}
            rel={hasNext ? "next" : undefined}
            aria-label={hasNext ? "Next page" : undefined}
            className={edgeLink}
          >
            <span>Next</span>
            <CaretRightIcon size={20} aria-hidden="true" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
