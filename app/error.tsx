"use client";

import { useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, WarningCircle } from "@phosphor-icons/react";

const pill =
  "inline-flex h-11 items-center gap-2 rounded-full px-5 text-sm font-medium transition-[background-color,color,transform] duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-60";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const retry = () => {
    // Refresh re-runs the server components; reset re-renders this segment.
    startTransition(() => {
      router.refresh();
      reset();
    });
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-gutter pb-20 pt-12 md:pt-20">
      <div className="max-w-[60ch]">
        <WarningCircle
          size={44}
          weight="duotone"
          className="text-subtle-foreground"
          aria-hidden="true"
        />
        <h1 className="mt-4 type-display-md text-foreground">Something went wrong</h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          This page could not be loaded. Try again, or go back to the home page.
        </p>
        {error.digest ? (
          <p className="mt-2 text-[13px] text-subtle-foreground">
            Error reference: <span className="font-mono">{error.digest}</span>
          </p>
        ) : null}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={retry}
          disabled={isPending}
          className={`${pill} bg-primary text-primary-foreground hover:bg-primary-hover`}
        >
          {isPending ? "Retrying..." : "Retry"}
        </button>
        <Link
          href="/"
          className={`${pill} border border-border bg-card text-foreground hover:bg-accent`}
        >
          <House size={20} aria-hidden="true" />
          Home
        </Link>
      </div>
    </div>
  );
}
