import type { Metadata } from "next";

import { RecommendationsView } from "@/components/account/recommendations-view";

export const metadata: Metadata = {
  title: "Recommendations",
  description: "Movies and series picked from what you watch, save and favorite.",
  alternates: { canonical: "/recommendations" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function RecommendationsPage() {
  return <RecommendationsView />;
}
