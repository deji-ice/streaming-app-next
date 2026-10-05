"use client";

import { useCallback, useEffect, useMemo, useRef, type RefObject } from "react";

import { PAGE_TITLE_ID } from "./page-shell";

/**
 * Keeps keyboard focus from falling to <body> when the item that has it is
 * removed. Call `expect(index)` right before removing; once the list has
 * shrunk, focus moves to the link now at that index (or the last link), or to
 * the page title when the list is empty. Call `cancel()` when the removal
 * failed so a later change does not steal focus.
 *
 * `listRef` must point at the <ul> whose <li> children each start with the
 * item's link.
 */
export function useRemovalFocus(listRef: RefObject<HTMLElement | null>, count: number) {
  const pending = useRef<number | null>(null);

  useEffect(() => {
    const index = pending.current;
    if (index === null) return;
    pending.current = null;
    const links = listRef.current?.querySelectorAll<HTMLElement>(":scope > li > a");
    const target =
      links && links.length > 0
        ? links[Math.min(index, links.length - 1)]
        : document.getElementById(PAGE_TITLE_ID);
    target?.focus();
  }, [count, listRef]);

  const expect = useCallback((index: number) => {
    pending.current = index;
  }, []);

  const cancel = useCallback(() => {
    pending.current = null;
  }, []);

  return useMemo(() => ({ expect, cancel }), [expect, cancel]);
}
