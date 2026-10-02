"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react";
import Link from "next/link";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { focusRing } from "./classes";

export type RailVariant = "poster" | "landscape" | "person" | "logo" | "ranked";

export interface RailProps {
  /** Section heading text (rendered in an h2.type-section). */
  title: ReactNode;
  /** Id for aria-labelledby; generated when absent. */
  headingId?: string;
  /** Optional "See all" link. */
  href?: string;
  /** Defaults to "See all". */
  hrefLabel?: string;
  /** Extra header control, for example the "Full cast & crew" button or a credit line. */
  action?: ReactNode;
  /** Optional row between the header and the items, for example season pills. */
  beforeList?: ReactNode;
  /**
   * CSS selector of an item to bring into view when the rail mounts, for
   * example the current episode. Set once, without animation.
   */
  initialSelector?: string;
  /** Items. Each child is wrapped in <li class="snap-start shrink-0">. */
  children: ReactNode;
  /** Controls the gap between items only. */
  variant?: RailVariant;
  className?: string;
}

const GAP: Record<RailVariant, string> = {
  poster: "gap-3 md:gap-4",
  landscape: "gap-3 md:gap-4",
  person: "gap-2 md:gap-3",
  logo: "gap-3 md:gap-4",
  ranked: "gap-4 md:gap-6",
};

function keyOf(child: ReturnType<typeof Children.toArray>[number], index: number): string {
  return isValidElement(child) && child.key !== null ? String(child.key) : String(index);
}

/** An item counts as "fully visible" above this ratio (absorbs subpixel rounding). */
const VISIBLE_RATIO = 0.98;

/**
 * Horizontal rail section. Full-bleed scroller with px-gutter padding so the
 * first card lines up with the heading and cards run off the right edge.
 *
 * Arrow buttons (md+) are disabled at the ends via an IntersectionObserver on
 * the first and last items (root = scroller); no scroll listeners. Each click
 * scrolls one viewport minus one card, smooth unless reduced motion is on.
 */
export function Rail({
  title,
  headingId,
  href,
  hrefLabel = "See all",
  action,
  beforeList,
  initialSelector,
  children,
  variant = "poster",
  className,
}: RailProps) {
  const autoId = useId();
  const id = headingId ?? `rail-${autoId}`;
  const linkTextId = `${id}-see-all`;
  const scrollerId = `${id}-items`;

  const scrollerRef = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const items = Children.toArray(children);
  const count = items.length;
  // Re-observe when the first or last item changes, not only when the count does.
  const edgeKey = count
    ? `${keyOf(items[0], 0)}|${keyOf(items[count - 1], count - 1)}|${count}`
    : "";
  const titleText = typeof title === "string" || typeof title === "number" ? String(title) : null;

  useEffect(() => {
    const scroller = scrollerRef.current;
    const first = scroller?.firstElementChild;
    const last = scroller?.lastElementChild;
    if (!scroller || !first || !last || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const visible = entry.isIntersecting && entry.intersectionRatio >= VISIBLE_RATIO;
          if (entry.target === first) setAtStart(visible);
          if (entry.target === last) setAtEnd(visible);
        }
      },
      { root: scroller, threshold: [0, VISIBLE_RATIO, 1] },
    );
    observer.observe(first);
    if (last !== first) observer.observe(last);
    return () => observer.disconnect();
  }, [edgeKey]);

  // Start with a given item (for example the current episode) in view.
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller || !initialSelector) return;
    const target = scroller.querySelector<HTMLElement>(initialSelector);
    if (!target) return;
    const box = scroller.getBoundingClientRect();
    const item = (target.closest("li") ?? target).getBoundingClientRect();
    const padding = parseFloat(getComputedStyle(scroller).scrollPaddingLeft) || 0;
    // Align the item with the gutter, like a snap would; never scroll the page.
    scroller.scrollLeft = Math.max(0, scroller.scrollLeft + (item.left - box.left) - padding);
  }, [initialSelector, edgeKey]);

  const scroll = useCallback((direction: 1 | -1) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const firstItem = scroller.firstElementChild as HTMLElement | null;
    const card = firstItem?.getBoundingClientRect().width ?? 0;
    const distance = Math.max(card, scroller.clientWidth - card);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    scroller.scrollBy({ left: direction * distance, behavior: reduce ? "auto" : "smooth" });
  }, []);

  if (count === 0) return null;

  const noOverflow = atStart && atEnd;
  const arrowClass = cn(
    "inline-flex size-10 items-center justify-center rounded-full border border-border bg-card text-foreground transition-[transform,background-color,opacity] duration-150 ease-out hover:bg-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40",
    focusRing,
  );

  return (
    <section aria-labelledby={id} className={cn("py-5 md:py-7", className)}>
      <div className="flex min-h-11 items-center justify-between gap-4 px-gutter">
        <h2 id={id} className="type-section min-w-0 text-foreground">
          {title}
        </h2>
        <div className="flex shrink-0 items-center gap-2 md:gap-3">
          {action}
          {href ? (
            <Link
              href={href}
              aria-labelledby={`${linkTextId} ${id}`}
              className={cn(
                "inline-flex min-h-11 items-center gap-1 rounded-full px-1 text-sm font-medium text-muted-foreground transition-colors duration-150 ease-out hover:text-primary md:min-h-10",
                focusRing,
              )}
            >
              <span id={linkTextId}>{hrefLabel}</span>
              <CaretRight size={16} aria-hidden="true" />
            </Link>
          ) : null}
          <div className={cn("hidden items-center gap-2 md:flex", noOverflow && "invisible")}>
            <button
              type="button"
              className={arrowClass}
              onClick={() => scroll(-1)}
              disabled={atStart}
              aria-controls={scrollerId}
              aria-label={titleText ? `Scroll ${titleText} left` : "Scroll left"}
            >
              <CaretLeft size={20} aria-hidden="true" />
            </button>
            <button
              type="button"
              className={arrowClass}
              onClick={() => scroll(1)}
              disabled={atEnd}
              aria-controls={scrollerId}
              aria-label={titleText ? `Scroll ${titleText} right` : "Scroll right"}
            >
              <CaretRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
      {beforeList}
      <ul
        id={scrollerId}
        ref={scrollerRef}
        // `relative` makes the scroller the containing block of absolutely
        // positioned descendants (sr-only text in cards). Without it they escape
        // the overflow clip and stretch the whole page to the rail's full length.
        className={cn(
          "no-scrollbar relative -mb-1 mt-2 flex snap-x snap-mandatory overflow-x-auto overscroll-x-contain px-gutter py-1 scroll-px-gutter",
          GAP[variant],
        )}
      >
        {items.map((child, index) => (
          <li
            key={keyOf(child, index)}
            className="shrink-0 snap-start"
          >
            {child}
          </li>
        ))}
      </ul>
    </section>
  );
}
