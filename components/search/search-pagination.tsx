import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { searchHref, type SearchState } from "./params";

type PageEntry = number | "gap";

/**
 * Page numbers to show: first, last, the current page and its neighbours,
 * with a few extra near either end so the row keeps a stable width. A gap
 * of exactly one page shows that page instead of an ellipsis.
 */
export function pageWindow(current: number, total: number): PageEntry[] {
  const pages = new Set<number>([1, total]);
  for (let page = current - 1; page <= current + 1; page += 1) {
    if (page >= 1 && page <= total) pages.add(page);
  }
  if (current <= 3) {
    for (let page = 2; page <= Math.min(4, total); page += 1) pages.add(page);
  }
  if (current >= total - 2) {
    for (let page = Math.max(total - 3, 1); page < total; page += 1) pages.add(page);
  }

  const sorted = Array.from(pages).sort((a, b) => a - b);
  const entries: PageEntry[] = [];
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && page - previous > 1) {
      entries.push(page - previous === 2 ? previous + 1 : "gap");
    }
    entries.push(page);
  });
  return entries;
}

/**
 * Real links that keep q, tab and filters. Small screens: Previous, "Page x of y", Next.
 * md and up: numbered pages as well.
 */
export function SearchPagination({ state, totalPages }: { state: SearchState; totalPages: number }) {
  if (totalPages <= 1) return null;

  const { page } = state;
  const hrefFor = (target: number) => searchHref({ ...state, page: target });

  return (
    <Pagination className="mt-10">
      <PaginationContent className="justify-center gap-1 md:gap-2">
        <PaginationItem>
          <PaginationPrevious href={hrefFor(page - 1)} disabled={page <= 1} prefetch={false} />
        </PaginationItem>

        <PaginationItem className="md:hidden">
          <span className="px-2 text-sm tabular-nums text-muted-foreground">
            Page {page} of {totalPages}
          </span>
        </PaginationItem>

        {pageWindow(page, totalPages).map((entry, index) =>
          entry === "gap" ? (
            <PaginationItem key={`gap-${index}`} className="hidden md:block">
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={entry} className="hidden md:block">
              <PaginationLink
                href={hrefFor(entry)}
                isActive={entry === page}
                aria-label={`Page ${entry}`}
                prefetch={false}
              >
                {entry}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext href={hrefFor(page + 1)} disabled={page >= totalPages} prefetch={false} />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
