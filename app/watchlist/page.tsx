import type { Metadata } from "next";

import { WatchlistView } from "@/components/account/library-view";

export const metadata: Metadata = {
  title: "Watchlist",
  description: "Movies and series you saved to watch later.",
  alternates: { canonical: "/watchlist" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function WatchlistPage() {
  return <WatchlistView />;
}
