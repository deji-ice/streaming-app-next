import type { Metadata } from "next";

import { HistoryView } from "@/components/account/history-view";

export const metadata: Metadata = {
  title: "History",
  description: "What you watched recently, on this device and in your account.",
  alternates: { canonical: "/history" },
  // Personal pages: keep them out of search results.
  robots: { index: false, follow: false },
};

export default function HistoryPage() {
  return <HistoryView />;
}
