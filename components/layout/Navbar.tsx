"use client";

import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

/*
 * Top bar. Kept deliberately light:
 * - Navbar itself has no React state, so it renders once. Pathname, search and
 *   account state live in small memoized islands that re-render on their own.
 * - Scroll state is a data-scrolled attribute written straight onto <header>
 *   by an IntersectionObserver (no scroll listener, no React render).
 * - SearchModal and the signed-in account menu are code-split and only load
 *   when needed (search: on intent or first open; menu: when signed in).
 * - No backdrop-filter, shadow or transform on <header>, so portaled overlays
 *   are never trapped inside it.
 */

const loadSearchModal = () => import("./SearchModal");
const SearchModal = dynamic(loadSearchModal, { ssr: false });

const UserProfileDropdown = dynamic(
  () => import("./UserProfileDropdown").then((mod) => mod.UserProfileDropdown),
  { ssr: false, loading: AvatarPlaceholder },
);

const FOCUS_RING =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

const startsWithSegment = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const NAV_LINKS: ReadonlyArray<{
  href: string;
  label: string;
  match: (pathname: string) => boolean;
}> = [
  { href: "/", label: "Home", match: (p) => p === "/" },
  {
    href: "/movie",
    label: "Movies",
    match: (p) => startsWithSegment(p, "/movie"),
  },
  {
    href: "/series",
    label: "Series",
    match: (p) => startsWithSegment(p, "/series"),
  },
  {
    href: "/browse",
    label: "Browse",
    match: (p) =>
      startsWithSegment(p, "/browse") ||
      startsWithSegment(p, "/company") ||
      startsWithSegment(p, "/network"),
  },
];

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const NON_TEXT_INPUT_TYPES = new Set([
  "button",
  "checkbox",
  "color",
  "file",
  "image",
  "radio",
  "range",
  "reset",
  "submit",
]);

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "INPUT") {
    return !NON_TEXT_INPUT_TYPES.has((target as HTMLInputElement).type);
  }
  return Boolean(target.closest('[role="textbox"], [role="combobox"]'));
}

function isInsideOtherDialog(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const dialog = target.closest('[role="dialog"], [role="alertdialog"]');
  return Boolean(dialog && !dialog.hasAttribute("data-search-dialog"));
}

const noopSubscribe = () => () => {};
const getIsApple = () =>
  /Mac|iPhone|iPad|iPod/.test(navigator.userAgent || "");
const getIsAppleServer = () => false;

/** Same node the layout renders as the first child of <body>. */
function getOrCreateSentinel(): { el: Element; created: boolean } {
  const existing = document.querySelector("[data-scroll-sentinel]");
  if (existing) return { el: existing, created: false };
  // Fallback only: the layout is expected to render this sentinel.
  const el = document.createElement("div");
  el.setAttribute("data-scroll-sentinel", "");
  el.setAttribute("aria-hidden", "true");
  el.style.cssText =
    "position:absolute;top:0;left:0;width:1px;height:1px;pointer-events:none;";
  document.body.prepend(el);
  return { el, created: true };
}

/* -------------------------------------------------------------------------- */
/* Islands                                                                    */
/* -------------------------------------------------------------------------- */

function AvatarPlaceholder() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center md:h-10 md:w-10"
    >
      <span className="h-8 w-8 rounded-full bg-muted" />
    </span>
  );
}

const Wordmark = memo(function Wordmark() {
  return (
    <Link
      href="/"
      aria-label="StreamScapeX home"
      className={`inline-flex h-11 shrink-0 items-center rounded-full font-display text-xl font-extrabold leading-none tracking-[-0.01em] text-foreground [font-stretch:80%] ${FOCUS_RING}`}
    >
      StreamScape<span className="text-primary">X</span>
    </Link>
  );
});

const DesktopNavLinks = memo(function DesktopNavLinks() {
  const pathname = usePathname() ?? "/";

  return (
    <nav aria-label="Main" className="hidden md:block">
      <ul className="flex items-center gap-1">
        {NAV_LINKS.map(({ href, label, match }) => {
          const active = match(pathname);
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`relative inline-flex h-10 items-center rounded-full px-3 text-sm font-medium ${FOCUS_RING} ${
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
                {active && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-x-3 bottom-0.5 h-0.5 rounded-full bg-primary"
                  />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
});

/**
 * Search triggers plus the global shortcut (Ctrl+K / Cmd+K, and "/" when focus
 * is not in an editable element). The modal chunk is preloaded on pointer or
 * focus intent and mounted only after the first open.
 */
const SearchControls = memo(function SearchControls() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const isApple = useSyncExternalStore(
    noopSubscribe,
    getIsApple,
    getIsAppleServer,
  );

  const openSearch = useCallback(() => {
    setMounted(true);
    setOpen(true);
  }, []);

  const preload = useCallback(() => {
    void loadSearchModal();
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.isComposing) return;

      const isModK =
        (event.metaKey || event.ctrlKey) &&
        !event.altKey &&
        !event.shiftKey &&
        event.key.toLowerCase() === "k";
      const isSlash =
        event.key === "/" && !event.metaKey && !event.ctrlKey && !event.altKey;
      if (!isModK && !isSlash) return;

      const target = event.target;
      if (isInsideOtherDialog(target)) return;

      if (isModK) {
        event.preventDefault();
        const inSearch =
          target instanceof Element &&
          Boolean(target.closest("[data-search-dialog]"));
        if (inSearch) {
          setOpen(false);
        } else {
          setMounted(true);
          setOpen(true);
        }
        return;
      }

      if (isEditableTarget(target)) return;
      event.preventDefault();
      setMounted(true);
      setOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openSearch}
        onPointerEnter={preload}
        onPointerDown={preload}
        onFocus={preload}
        aria-haspopup="dialog"
        aria-keyshortcuts="Control+K Meta+K /"
        className={`hidden h-10 items-center gap-2 rounded-full border border-border bg-card pl-3 pr-2 text-sm text-muted-foreground transition-transform duration-150 ease-out hover:bg-accent hover:text-foreground active:scale-[0.98] md:inline-flex md:w-44 lg:w-64 ${FOCUS_RING}`}
      >
        <MagnifyingGlassIcon size={20} aria-hidden="true" className="shrink-0" />
        <span className="pr-1">Search</span>
        <kbd
          aria-hidden="true"
          className="ml-auto hidden h-6 items-center rounded-full border border-border px-2 font-sans text-[12px] font-medium text-subtle-foreground lg:inline-flex"
        >
          {isApple ? "⌘K" : "Ctrl K"}
        </kbd>
      </button>

      <button
        type="button"
        onClick={openSearch}
        onPointerDown={preload}
        aria-label="Search"
        aria-haspopup="dialog"
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-foreground transition-transform duration-150 ease-out hover:bg-accent active:scale-[0.98] md:hidden ${FOCUS_RING}`}
      >
        <MagnifyingGlassIcon size={24} aria-hidden="true" />
      </button>

      {mounted && <SearchModal open={open} onOpenChange={setOpen} />}
    </>
  );
});

/**
 * Signed out: "Sign in" pill that opens the auth modal.
 * Signed in: avatar button with the account menu (lazy chunk).
 * While the session resolves, an invisible pill reserves the same width so the
 * search trigger does not shift for signed-out visitors.
 */
const AccountControl = memo(function AccountControl() {
  const { user, session, isAuthenticated, isLoading } = useUser();
  const { openAuthModal } = useAuthModal();

  const name = user?.name ?? null;
  const email = user?.email ?? session?.user?.email ?? null;
  const image = user?.image ?? null;
  const profile = useMemo(
    () => ({ name, email, image }),
    [name, email, image],
  );

  if (isAuthenticated) {
    return <UserProfileDropdown user={profile} />;
  }

  const pillClass =
    "inline-flex h-11 shrink-0 items-center rounded-full px-4 text-sm font-semibold md:h-10";

  if (isLoading) {
    return (
      <span aria-hidden="true" className={`${pillClass} invisible`}>
        Sign in
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={openAuthModal}
      aria-haspopup="dialog"
      className={`${pillClass} bg-primary text-primary-foreground transition-transform duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] ${FOCUS_RING}`}
    >
      Sign in
    </button>
  );
});

/* -------------------------------------------------------------------------- */
/* Navbar                                                                     */
/* -------------------------------------------------------------------------- */

export default function Navbar() {
  const headerRef = useRef<HTMLElement>(null);

  // Scroll hairline: toggle data-scrolled on <header> directly. No React state.
  useEffect(() => {
    const header = headerRef.current;
    if (!header || typeof IntersectionObserver === "undefined") return;
    const { el: sentinel, created } = getOrCreateSentinel();
    const observer = new IntersectionObserver(([entry]) => {
      header.dataset.scrolled = entry.isIntersecting ? "false" : "true";
    });
    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      if (created) sentinel.remove();
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className="group/nav sticky top-0 z-nav box-content h-14 bg-background pt-[env(safe-area-inset-top)] md:h-16"
    >
      <div className="flex h-full items-center gap-3 px-gutter md:gap-8">
        <Wordmark />
        <DesktopNavLinks />
        <div className="ml-auto flex items-center gap-1 md:gap-3">
          <SearchControls />
          <AccountControl />
        </div>
      </div>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-border opacity-0 transition-opacity duration-150 ease-out group-data-[scrolled=true]/nav:opacity-100"
      />
    </header>
  );
}
