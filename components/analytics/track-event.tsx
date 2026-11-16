"use client";

import { useEffect } from "react";

import { trackEvent, type AnalyticsEvent, type AnalyticsParams } from "@/lib/analytics";

/** Last key sent per event name, so a re-render or tab switch on the same page does not count twice. */
const lastSent = new Map<AnalyticsEvent, string>();

/**
 * Sends one analytics event when it mounts. Lets Server Components record a visit
 * (a search, a streaming service page) without becoming client components.
 * Renders nothing. `dedupeKey` decides what counts as "the same" as the last event
 * of this name; it defaults to the parameters.
 */
export function TrackEvent({
  name,
  params,
  dedupeKey,
}: {
  name: AnalyticsEvent;
  params?: AnalyticsParams;
  dedupeKey?: string;
}) {
  const key = dedupeKey ?? JSON.stringify(params ?? {});

  useEffect(() => {
    if (lastSent.get(name) === key) return;
    lastSent.set(name, key);
    trackEvent(name, params);
    // `params` is a new object on every render; `key` stands in for it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name, key]);

  return null;
}
