import type { Metadata } from "next";

import { DashboardView } from "@/components/account/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Your library at a glance: continue watching, watchlist and favorites.",
  alternates: { canonical: "/dashboard" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function DashboardPage() {
  return <DashboardView />;
}
