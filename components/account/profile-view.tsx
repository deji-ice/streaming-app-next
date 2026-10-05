"use client";

import {
  CalendarBlankIcon,
  EnvelopeSimpleIcon,
  FloppyDiskIcon,
  PencilSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { toast } from "sonner";

import { EmptyState } from "@/components/ds/empty-state";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useUserProfile } from "@/hooks/useUserProfile";
import { formatDate, getInitials } from "@/lib/format";
import { useUserStore } from "@/lib/store";

import { AuthGate } from "./auth-gate";
import { LibraryCounts } from "./library-counts";
import { AccountPage } from "./page-shell";
import { ProfileSkeleton } from "./skeletons";

const NAME_MAX = 80;
const USERNAME_MAX = 30;

const labelClass = "mb-2 block text-sm font-medium text-foreground";

function ProfileContent() {
  const { profile, stats, isLoading, updateProfile, refresh } = useUserProfile();
  const sessionUser = useUserStore((state) => state.user);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const editButtonRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // After saving or cancelling, the form disappears: put focus back on the Edit button.
  useEffect(() => {
    if (!editing && returnFocus.current) {
      returnFocus.current = false;
      editButtonRef.current?.focus();
    }
  }, [editing]);

  if (isLoading) return <ProfileSkeleton />;

  if (!profile) {
    return (
      <AccountPage title="Profile">
        <EmptyState
          className="mt-8"
          icon={<WarningCircleIcon weight="duotone" />}
          title="Could not load your profile"
          body="Check your connection and try again."
          action={
            <Button variant="secondary" onClick={refresh}>
              Try again
            </Button>
          }
        />
      </AccountPage>
    );
  }

  const displayName = profile.full_name || profile.username || sessionUser?.name || "Your account";
  const email = profile.email || sessionUser?.email || "";
  const avatarUrl = profile.avatar_url || sessionUser?.image || undefined;
  const memberSince = formatDate(profile.created_at, "monthYear");

  // Seed the form from the saved profile every time editing starts, so saving
  // never overwrites a field the user did not touch with an empty value.
  const startEditing = () => {
    setFullName(profile.full_name ?? "");
    setUsername(profile.username ?? "");
    setFormError(null);
    setEditing(true);
  };

  const stopEditing = () => {
    returnFocus.current = true;
    setEditing(false);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = fullName.trim();
    const nextUsername = username.trim();

    setSaving(true);
    setFormError(null);
    const saved = await updateProfile({
      full_name: nextName || null,
      username: nextUsername || null,
    });
    setSaving(false);

    if (!saved) {
      setFormError("Could not save your changes. If you changed your username, it may already be taken.");
      return;
    }

    // Keep the navbar avatar and name in step with the saved profile.
    const store = useUserStore.getState();
    if (store.user) {
      store.setUser({ ...store.user, name: nextName || null, updated_at: new Date().toISOString() });
    }
    toast.success("Profile updated");
    stopEditing();
  };

  return (
    <AccountPage title="Profile" description="Your account details and activity.">
      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,640px)_minmax(0,360px)] lg:gap-14">
        <section aria-labelledby="account-heading">
          <h2 id="account-heading" className="type-section text-foreground">
            Account
          </h2>
          <div className="mt-4 rounded-panel border border-border bg-card p-6 sm:p-8">
            <div className="flex items-center gap-4 sm:gap-5">
              <Avatar className="size-20 sm:size-24">
                <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-secondary font-display text-2xl font-bold text-muted-foreground">
                  {getInitials(displayName) || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="break-words font-display text-2xl font-bold leading-tight text-foreground">
                  {displayName}
                </p>
                {profile.username && profile.full_name ? (
                  <p className="mt-0.5 break-all text-sm text-muted-foreground">@{profile.username}</p>
                ) : null}
                {email ? (
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                    <EnvelopeSimpleIcon size={16} aria-hidden="true" className="shrink-0" />
                    <span className="break-all">{email}</span>
                  </p>
                ) : null}
              </div>
            </div>

            {memberSince ? (
              <p className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarBlankIcon size={16} aria-hidden="true" className="shrink-0" />
                Member since {memberSince}
              </p>
            ) : null}

            {editing ? (
              <form onSubmit={handleSubmit} className="mt-6 space-y-5 border-t border-border pt-6">
                <div>
                  <label htmlFor="profile-full-name" className={labelClass}>
                    Full name
                  </label>
                  <Input
                    id="profile-full-name"
                    name="full_name"
                    autoComplete="name"
                    autoFocus
                    maxLength={NAME_MAX}
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    className="bg-background"
                  />
                </div>
                <div>
                  <label htmlFor="profile-username" className={labelClass}>
                    Username
                  </label>
                  <Input
                    id="profile-username"
                    name="username"
                    autoComplete="username"
                    autoCapitalize="off"
                    maxLength={USERNAME_MAX}
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    aria-describedby="profile-username-hint"
                    className="bg-background"
                  />
                  <p id="profile-username-hint" className="mt-2 text-[13px] text-subtle-foreground">
                    Usernames are unique. Leave it empty to remove yours.
                  </p>
                </div>

                {formError ? (
                  <p role="alert" className="flex items-start gap-2 text-sm text-destructive">
                    <WarningCircleIcon size={18} aria-hidden="true" className="mt-0.5 shrink-0" />
                    {formError}
                  </p>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" disabled={saving}>
                    <FloppyDiskIcon aria-hidden="true" />
                    {saving ? "Saving..." : "Save changes"}
                  </Button>
                  <Button type="button" variant="secondary" onClick={stopEditing} disabled={saving}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button ref={editButtonRef} variant="secondary" className="mt-6" onClick={startEditing}>
                <PencilSimpleIcon aria-hidden="true" />
                Edit profile
              </Button>
            )}
          </div>
        </section>

        <section aria-labelledby="activity-heading">
          <h2 id="activity-heading" className="type-section text-foreground">
            Activity
          </h2>
          <LibraryCounts
            layout="list"
            className="mt-4"
            items={[
              { label: "Movies watched", value: stats?.totalMoviesWatched },
              { label: "Series watched", value: stats?.totalSeriesWatched },
              { label: "Watchlist", value: stats?.watchlistCount },
              { label: "Favorites", value: stats?.favoritesCount },
            ]}
          />
        </section>
      </div>
    </AccountPage>
  );
}

export function ProfileView() {
  return (
    <AuthGate title="Profile" what="your profile" fallback={<ProfileSkeleton />}>
      <ProfileContent />
    </AuthGate>
  );
}
