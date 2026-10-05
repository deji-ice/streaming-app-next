"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import {
  BookmarkSimpleIcon,
  ClockCounterClockwiseIcon,
  HeartIcon,
  SignOutIcon,
  SquaresFourIcon,
  UserIcon,
  type Icon,
} from "@phosphor-icons/react";
import { supabase } from "@/lib/supabase";

export interface UserProfileDropdownUser {
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface UserProfileDropdownProps {
  user: UserProfileDropdownUser | null;
}

const MENU_LINKS: ReadonlyArray<{ href: string; label: string; icon: Icon }> = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFourIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
  { href: "/watchlist", label: "Watchlist", icon: BookmarkSimpleIcon },
  { href: "/favorites", label: "Favorites", icon: HeartIcon },
  { href: "/history", label: "History", icon: ClockCounterClockwiseIcon },
];

const ITEM_CLASS =
  "flex h-11 cursor-pointer select-none items-center gap-3 rounded-media px-3 text-sm font-medium text-foreground outline-none data-[highlighted]:bg-accent focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring md:h-10";

/**
 * Signed-in account menu (avatar trigger + Radix DropdownMenu).
 * Rendered by Navbar only when the user is authenticated; Navbar passes the
 * profile in so this component does not subscribe to the user store itself.
 */
export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const name = user?.name?.trim() || null;
  const email = user?.email?.trim() || null;
  const initial = (name || email || "U").charAt(0).toUpperCase();

  // Same sign-out behavior as before: Supabase signOut, then the menu closes
  // (Radix closes the menu when an item is selected).
  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <DropdownMenu.Root modal={false}>
      <DropdownMenu.Trigger asChild>
        <button
          type="button"
          aria-label="Account menu"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:h-10 md:w-10"
        >
          <UserAvatar
            image={user?.image}
            label={name || email || "Account"}
            initial={initial}
            className="h-8 w-8 text-sm"
          />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          collisionPadding={12}
          className="z-popover w-64 origin-[--radix-dropdown-menu-content-transform-origin] rounded-panel border border-border bg-popover p-1.5 text-popover-foreground duration-150 ease-out data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-[0.98] data-[state=closed]:zoom-out-[0.98]"
        >
          <DropdownMenu.Label className="flex items-center gap-3 px-3 py-2.5">
            <UserAvatar
              image={user?.image}
              label=""
              initial={initial}
              className="h-10 w-10 text-base"
            />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold text-foreground">
                {name || "Account"}
              </span>
              {email && (
                <span className="block truncate text-[13px] text-subtle-foreground">
                  {email}
                </span>
              )}
            </span>
          </DropdownMenu.Label>

          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />

          {MENU_LINKS.map(({ href, label, icon: ItemIcon }) => (
            <DropdownMenu.Item key={href} asChild className={ITEM_CLASS}>
              <Link href={href} prefetch={false}>
                <ItemIcon
                  size={20}
                  aria-hidden="true"
                  className="shrink-0 text-muted-foreground"
                />
                <span>{label}</span>
              </Link>
            </DropdownMenu.Item>
          ))}

          <DropdownMenu.Separator className="my-1.5 h-px bg-border" />

          <DropdownMenu.Item className={ITEM_CLASS} onSelect={handleSignOut}>
            <SignOutIcon
              size={20}
              aria-hidden="true"
              className="shrink-0 text-muted-foreground"
            />
            <span>Sign out</span>
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function UserAvatar({
  image,
  label,
  initial,
  className,
}: {
  image?: string | null;
  label: string;
  initial: string;
  className: string;
}) {
  return (
    <AvatarPrimitive.Root
      className={`relative flex shrink-0 overflow-hidden rounded-full bg-muted ${className}`}
    >
      {image && (
        <AvatarPrimitive.Image
          src={image}
          alt={label}
          className="h-full w-full object-cover"
        />
      )}
      <AvatarPrimitive.Fallback
        aria-hidden="true"
        className="flex h-full w-full items-center justify-center rounded-full bg-muted font-semibold text-foreground"
      >
        {initial}
      </AvatarPrimitive.Fallback>
    </AvatarPrimitive.Root>
  );
}

export default UserProfileDropdown;
