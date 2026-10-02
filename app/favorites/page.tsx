import type { Metadata } from "next";

import { FavoritesView } from "@/components/account/library-view";

export const metadata: Metadata = {
  title: "Favorites",
  description: "Movies and series you marked as favorites.",
  alternates: { canonical: "/favorites" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return <FavoritesView />;
}
