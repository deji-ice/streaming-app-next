"use client";

import { useRouter } from "next/navigation";
import type { FormEvent, ReactNode } from "react";

/**
 * The /search form. Without JavaScript it is a plain GET form to /search.
 * With JavaScript it navigates client side to the same URL, leaving out empty
 * fields ("Any year", an empty query) so URLs stay short.
 *
 * The inputs are server-rendered and passed in as children; only this wrapper
 * ships to the client.
 */
export function SearchFormShell({ children, className }: { children: ReactNode; className?: string }) {
  const router = useRouter();

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const params = new URLSearchParams();
    for (const [name, value] of data.entries()) {
      if (typeof value !== "string") continue;
      const trimmed = value.replace(/\s+/g, " ").trim();
      if (trimmed !== "") params.set(name, trimmed);
    }
    const query = params.toString();
    router.push(query ? `/search?${query}` : "/search");
  }

  return (
    <form action="/search" method="get" role="search" onSubmit={onSubmit} className={className}>
      {children}
    </form>
  );
}
