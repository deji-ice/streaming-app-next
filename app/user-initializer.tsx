"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { useUserStore } from "@/lib/store";

const SUPABASE_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
);

/**
 * The single auth bootstrap for the whole app. Mount it once (app/layout.tsx).
 *
 * - One supabase.auth.onAuthStateChange subscription. Its INITIAL_SESSION event
 *   delivers the stored session, so there is no separate getSession() race.
 * - The callback only writes { session, status } to the store synchronously.
 *   Supabase calls (profile read/ensure) are deferred with setTimeout(0), as
 *   auth-js requires, and are deduped per user id inside the store.
 * - supabase-js is imported lazily so it stays out of the critical path.
 */
function useAuthBootstrap() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!SUPABASE_CONFIGURED) {
      useUserStore.getState().setSession(null);
      return;
    }

    let cancelled = false;
    let unsubscribe: (() => void) | null = null;
    const timers = new Set<ReturnType<typeof setTimeout>>();

    import("@/lib/supabase")
      .then(({ supabase }) => {
        if (cancelled) return;
        const { data } = supabase.auth.onAuthStateChange(
          (event: AuthChangeEvent, session: Session | null) => {
            useUserStore.getState().setSession(session);
            // Drop the previous account's cached watchlist/favorites/history, and this
            // browser's local watch history: it is merged into whichever account signs
            // in next, so on a shared device it would otherwise carry over.
            if (event === "SIGNED_OUT") {
              void import("@/lib/user-data").then((m) =>
                m.resetUserDataCache(queryClient),
              );
              void import("@/lib/history").then((m) => m.clearLocalHistory());
            }

            const userId = session?.user?.id;
            if (!userId) return;
            const timer = setTimeout(() => {
              timers.delete(timer);
              void useUserStore.getState().fetchUser(userId);
            }, 0);
            timers.add(timer);
          },
        );
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {
        if (!cancelled) useUserStore.getState().setSession(null);
      });

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      timers.clear();
      unsubscribe?.();
    };
  }, [queryClient]);
}

/**
 * Mount exactly once (app/layout.tsx). Works as a wrapper (`<UserInitializer>{children}</UserInitializer>`)
 * or self-closing (`<UserInitializer />`).
 */
export function UserInitializer({ children }: { children?: React.ReactNode }) {
  useAuthBootstrap();
  return <>{children}</>;
}
