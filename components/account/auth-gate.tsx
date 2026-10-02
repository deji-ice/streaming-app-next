"use client";

import { UserCircleIcon } from "@phosphor-icons/react";
import { useEffect, type ReactNode } from "react";

import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { EmptyState } from "@/components/ds/empty-state";
import { Button } from "@/components/ui/button";
import { useAuthStatus } from "@/hooks/useUser";

import { AccountPage } from "./page-shell";

interface AuthGateProps {
  /** The page h1, shown in the signed-out state. */
  title: string;
  /** What signing in unlocks, for the empty state: "your watchlist". */
  what: string;
  /** Rendered while the session is still being resolved. Should mirror the page layout. */
  fallback: ReactNode;
  children: ReactNode;
}

/**
 * Gate for pages that need an account. Signed out: opens the sign-in dialog
 * (as before) and leaves a visible page behind it with a Sign in button, so
 * closing the dialog does not leave a blank page.
 *
 * Children only mount once the user is signed in, so their data hooks never
 * run for signed-out visitors.
 */
export function AuthGate({ title, what, fallback, children }: AuthGateProps) {
  const status = useAuthStatus();
  const { openAuthModal } = useAuthModal();

  useEffect(() => {
    if (status === "unauthenticated") openAuthModal();
  }, [status, openAuthModal]);

  if (status === "loading") return <>{fallback}</>;

  if (status === "unauthenticated") {
    return (
      <AccountPage title={title}>
        <EmptyState
          className="mt-8"
          icon={<UserCircleIcon weight="duotone" />}
          title={`Sign in to see ${what}`}
          body="Your lists and history are saved to your account."
          action={<Button onClick={() => openAuthModal()}>Sign in</Button>}
        />
      </AccountPage>
    );
  }

  return <>{children}</>;
}
