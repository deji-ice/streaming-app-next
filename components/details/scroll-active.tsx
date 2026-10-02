"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Scroller that starts with its current item in view: horizontal (season
 * pills) or vertical (the episode panel). Server-rendered children, one tiny
 * client effect that sets the scroll offset once after mount (no animation,
 * never scrolls the page itself).
 */
export function ScrollActive({
  children,
  className,
  axis = "x",
  selector = '[aria-current="true"]',
}: {
  children: ReactNode;
  className?: string;
  axis?: "x" | "y";
  /** The element to bring into view; defaults to the aria-current item. */
  selector?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = ref.current;
    const active = scroller?.querySelector<HTMLElement>(selector);
    if (!scroller || !active) return;
    // Rect math works wherever the item sits in the subtree (offsetParent may not be the scroller).
    const box = scroller.getBoundingClientRect();
    const item = active.getBoundingClientRect();
    if (axis === "x") {
      const target = scroller.scrollLeft + (item.left - box.left) - (box.width - item.width) / 2;
      scroller.scrollLeft = Math.max(0, target);
    } else {
      const target = scroller.scrollTop + (item.top - box.top) - (box.height - item.height) / 2;
      scroller.scrollTop = Math.max(0, target);
    }
  }, [axis, selector]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
