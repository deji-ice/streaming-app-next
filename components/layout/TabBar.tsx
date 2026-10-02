"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CompassIcon,
  FilmSlateIcon,
  HouseIcon,
  TelevisionIcon,
  UserCircleIcon,
  type Icon,
} from "@phosphor-icons/react";
import { useUser } from "@/hooks/useUser";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

type TabMatch = (pathname: string) => boolean;

const startsWithSegment = (pathname: string, base: string) =>
  pathname === base || pathname.startsWith(`${base}/`);

const ACCOUNT_ROUTES = [
  "/dashboard",
  "/profile",
  "/watchlist",
  "/favorites",
  "/history",
  "/recommendations",
];

const TABS: ReadonlyArray<{
  href: string;
  label: string;
  icon: Icon;
  match: TabMatch;
}> = [
  { href: "/", label: "Home", icon: HouseIcon, match: (p) => p === "/" },
  {
    href: "/movie",
    label: "Movies",
    icon: FilmSlateIcon,
    match: (p) => startsWithSegment(p, "/movie"),
  },
  {
    href: "/series",
    label: "Series",
    icon: TelevisionIcon,
    match: (p) => startsWithSegment(p, "/series"),
  },
  {
    href: "/browse",
    label: "Browse",
    icon: CompassIcon,
    match: (p) =>
      startsWithSegment(p, "/browse") ||
      startsWithSegment(p, "/company") ||
      startsWithSegment(p, "/network"),
  },
];

const isAccountRoute = (pathname: string) =>
  ACCOUNT_ROUTES.some((base) => startsWithSegment(pathname, base));

const ITEM_CLASS =
  "relative flex h-full min-h-11 w-full flex-col items-center justify-center gap-1 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

function ItemContent({
  icon: ItemIcon,
  label,
  active,
}: {
  icon: Icon;
  label: string;
  active: boolean;
}) {
  return (
    <>
      {active && (
        <span
          aria-hidden="true"
          className="absolute inset-x-5 -top-px h-0.5 rounded-full bg-primary"
        />
      )}
      <ItemIcon size={24} weight={active ? "fill" : "regular"} aria-hidden="true" />
      <span className="leading-none">{label}</span>
    </>
  );
}

const TabLink = memo(function TabLink({
  href,
  label,
  icon,
  active,
}: {
  href: string;
  label: string;
  icon: Icon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${ITEM_CLASS} ${active ? "text-foreground" : "text-subtle-foreground"}`}
    >
      <ItemContent icon={icon} label={label} active={active} />
    </Link>
  );
});

/**
 * "You" tab: links to /dashboard when signed in. When signed out it opens the
 * auth modal instead of navigating. While the session is still resolving it
 * renders the link (the dashboard handles its own gating), so a signed-in
 * user is never shown the sign-in modal by mistake.
 */
const YouTab = memo(function YouTab({ active }: { active: boolean }) {
  const { isAuthenticated, isLoading } = useUser();
  const { openAuthModal } = useAuthModal();

  if (!isAuthenticated && !isLoading) {
    return (
      <button
        type="button"
        onClick={openAuthModal}
        aria-haspopup="dialog"
        className={`${ITEM_CLASS} text-subtle-foreground`}
      >
        <ItemContent icon={UserCircleIcon} label="You" active={false} />
      </button>
    );
  }

  return (
    <TabLink
      href="/dashboard"
      label="You"
      icon={UserCircleIcon}
      active={active}
    />
  );
});

/**
 * Mobile bottom tab bar (hidden at md+). Fixed, z-nav, 64px plus the safe-area
 * inset. The layout must give the main wrapper matching bottom padding:
 * pb-[calc(64px+env(safe-area-inset-bottom))] md:pb-0.
 */
function TabBar() {
  const pathname = usePathname() ?? "/";

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-nav border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <ul className="grid h-16 grid-cols-5">
        {TABS.map((tab) => (
          <li key={tab.href} className="flex">
            <TabLink
              href={tab.href}
              label={tab.label}
              icon={tab.icon}
              active={tab.match(pathname)}
            />
          </li>
        ))}
        <li className="flex">
          <YouTab active={isAccountRoute(pathname)} />
        </li>
      </ul>
    </nav>
  );
}

export default memo(TabBar);
