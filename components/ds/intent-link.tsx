"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, type ComponentProps, type FocusEvent, type PointerEvent } from "react";

export type IntentLinkProps = Omit<ComponentProps<typeof Link>, "prefetch">;

/** How long the pointer has to rest on a link before it is prefetched. */
const HOVER_DELAY_MS = 90;

/**
 * next/link for cards and grid items: no viewport prefetch (one Worker
 * invocation per visible card otherwise), but prefetch on intent instead:
 * after a short hover, immediately on keyboard focus or on touch.
 * Server Components can render it and pass server-rendered children.
 */
export function IntentLink({ href, onPointerEnter, onPointerLeave, onFocus, ...rest }: IntentLinkProps) {
  const router = useRouter();
  const prefetched = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const target = typeof href === "string" ? href : null;

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  useEffect(() => clear, [clear]);

  const prefetch = useCallback(() => {
    clear();
    if (prefetched.current || !target || !target.startsWith("/")) return;
    prefetched.current = true;
    router.prefetch(target);
  }, [clear, router, target]);

  return (
    <Link
      href={href}
      prefetch={false}
      onPointerEnter={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerEnter?.(event);
        if (event.pointerType === "mouse") {
          clear();
          timer.current = setTimeout(prefetch, HOVER_DELAY_MS);
        } else {
          prefetch();
        }
      }}
      onPointerLeave={(event: PointerEvent<HTMLAnchorElement>) => {
        onPointerLeave?.(event);
        clear();
      }}
      onFocus={(event: FocusEvent<HTMLAnchorElement>) => {
        onFocus?.(event);
        prefetch();
      }}
      {...rest}
    />
  );
}
