"use client";

import { lazy, Suspense, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { AuthModalProvider } from "@/components/auth/AuthModalProvider";

// Devtools are opt-in: set NEXT_PUBLIC_RQ_DEVTOOLS=1 in .env.local to show the floating button
// (off by default because it sits on top of the mobile tab bar). In production the condition is
// constant-false, so the bundler drops the import.
const ReactQueryDevtools =
  process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_RQ_DEVTOOLS === "1"
    ? lazy(() =>
        import("@tanstack/react-query-devtools").then((m) => ({
          default: m.ReactQueryDevtools,
        })),
      )
    : null;

export function Providers({ children }: { children: React.ReactNode }) {
  // Create QueryClient inside the component to ensure it's unique per request
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes - data is considered fresh
            gcTime: 30 * 60 * 1000, // 30 minutes - cache garbage collection time
            refetchOnWindowFocus: false,
            refetchOnMount: false, // Don't refetch on mount if data is fresh
            retry: 1,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthModalProvider>
        {children}
        {/* Mobile (<=600px, sonner's breakpoint): sit above the bottom tab bar.
            Wider screens use --toast-offset-bottom when globals.css defines it (tab bar visible below md). */}
        <Toaster
          theme="dark"
          offset={{ bottom: "var(--toast-offset-bottom, 24px)" }}
          mobileOffset={{ bottom: "calc(64px + env(safe-area-inset-bottom) + 12px)" }}
        />
        {ReactQueryDevtools ? (
          <Suspense fallback={null}>
            <ReactQueryDevtools initialIsOpen={false} />
          </Suspense>
        ) : null}
      </AuthModalProvider>
    </QueryClientProvider>
  );
}
