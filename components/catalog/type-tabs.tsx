import Link from "next/link";
import { FilmSlateIcon, TelevisionIcon } from "@phosphor-icons/react/dist/ssr";

import { cn } from "@/lib/utils";

import { canonicalSort, catalogHref, DEFAULT_SORT, type CatalogQuery, type CatalogType } from "./params";

const TABS = [
  { type: "movie", label: "Movies", Icon: FilmSlateIcon },
  { type: "tv", label: "Series", Icon: TelevisionIcon },
] as const;

export interface TypeTabsProps {
  /** The type the page shows. */
  value: CatalogType;
  /** Path of the page, for example /browse/netflix. */
  basePath: string;
  /** Every other param the page keeps (sort). Genres and page are dropped on purpose. */
  query: CatalogQuery;
  className?: string;
}

/**
 * Movies | Series switch. Links, not client tabs: each tab is a URL
 * (?type=movie | ?type=tv), the current one has aria-current="page". Always
 * writes ?type explicitly so a page that picks a type for you (the first one
 * with titles) still lets you open the other, empty one. Switching drops the
 * genre filter (movie and TV genre ids differ) and the page number, and keeps
 * the sort ("newest" is stored per type).
 */
export function TypeTabs({ value, basePath, query, className }: TypeTabsProps) {
  return (
    <nav aria-label="Media type" className={cn("w-full sm:w-auto", className)}>
      <ul
        role="list"
        className="flex w-full gap-1 rounded-full border border-border bg-card p-1 sm:inline-flex sm:w-auto"
      >
        {TABS.map(({ type, label, Icon }) => {
          const active = type === value;
          const sort = canonicalSort(type, typeof query.sort === "string" ? query.sort : null);
          const href = catalogHref(basePath, {
            ...query,
            type,
            sort: sort === DEFAULT_SORT ? undefined : sort,
            genres: undefined,
          });
          return (
            <li key={type} className="flex-1 sm:flex-none">
              <Link
                href={href}
                prefetch={false}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex h-11 w-full select-none items-center justify-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-medium transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card sm:min-w-28 md:h-9",
                  active
                    ? "bg-primary text-primary-foreground hover:bg-primary-hover"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon size={20} weight={active ? "fill" : "regular"} aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
