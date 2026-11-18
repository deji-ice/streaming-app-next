"use client";

import { useEffect, useState } from "react";

/** A shuffled copy (Fisher-Yates). */
function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * One random order per page (path and query), shared by every unit on it, so
 * two ads on the same page can take different positions and never show the
 * same bag. A new page gets a new order.
 */
let pageOrder: { key: string; source: readonly unknown[]; order: readonly unknown[] } | null = null;

function orderForPage<T>(items: readonly T[]): readonly T[] {
  const key = window.location.pathname + window.location.search;
  if (!pageOrder || pageOrder.key !== key || pageOrder.source !== items) {
    pageOrder = { key, source: items, order: shuffle(items) };
  }
  return pageOrder.order as readonly T[];
}

/**
 * The items in this page's random order, picked in the browser, so each page
 * view gets a different mix while pages stay static and cacheable. The server
 * render and the first client render use the given order (no hydration
 * mismatch); the shuffle lands right after. Every sponsor unit starts below the
 * fold or mounts after hydration, so the swap is not seen.
 */
export function useShuffled<T>(items: readonly T[]): readonly T[] {
  const [order, setOrder] = useState<readonly T[]>(items);
  useEffect(() => {
    setOrder(orderForPage(items));
  }, [items]);
  return order;
}
