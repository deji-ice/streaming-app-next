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
 * The items in a random order, picked once per mount in the browser, so each page
 * view gets a different mix while pages stay static and cacheable. The server
 * render and the first client render use the given order (no hydration mismatch);
 * the shuffle lands right after. Every sponsor unit starts below the fold or
 * mounts after hydration, so the swap is not seen.
 */
export function useShuffled<T>(items: readonly T[]): readonly T[] {
  const [order, setOrder] = useState<readonly T[]>(items);
  useEffect(() => {
    setOrder(shuffle(items));
  }, [items]);
  return order;
}
