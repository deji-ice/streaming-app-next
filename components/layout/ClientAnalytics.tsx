"use client";

import { usePageViewTracking } from "@/hooks/useAnalytics";

export default function ClientAnalytics() {
  usePageViewTracking();
  return null;
}