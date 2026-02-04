"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside the component to ensure it's unique per request
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection time (formerly cacheTime)
            refetchOnWindowFocus: false, // Disable refetch on window focus for better UX
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            retry: 1, // Only retry failed requests once
          },
          mutations: {
            retry: 0, // Don't retry mutations
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
