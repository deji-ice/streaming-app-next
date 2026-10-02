"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Eye, EyeSlash, GoogleLogo } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

type AuthMode = "signin" | "signup";

interface AuthFormProps {
  onSuccess?: () => void;
  /**
   * Optional header renderer. AuthModal uses it to render the title and description
   * as the dialog's accessible name and description. Defaults to an h2 + paragraph.
   */
  renderHeader?: (header: { title: string; description: string }) => React.ReactNode;
}

const COPY: Record<AuthMode, { title: string; description: string; submit: string; pending: string }> = {
  signin: {
    title: "Sign in",
    description: "Sign in to keep your watchlist, favorites and history in sync.",
    submit: "Sign in",
    pending: "Signing in...",
  },
  signup: {
    title: "Create account",
    description: "Create an account to save your watchlist, favorites and history.",
    submit: "Create account",
    pending: "Creating account...",
  },
};

const NOT_CONFIGURED_MESSAGE =
  "Sign-in is not configured. Set the Supabase environment variables in .env.local (see PHASE2-SETUP.md).";

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-popover";

const inputClass = cn(
  "block h-12 w-full rounded-full border border-input bg-card px-5 text-base text-foreground placeholder:text-subtle-foreground transition-colors duration-150 ease-out md:text-sm",
  "disabled:cursor-not-allowed disabled:opacity-60",
  focusRing,
);

const labelClass = "block text-sm font-medium text-foreground";

function errorText(err: unknown): string {
  const message =
    err && typeof err === "object" && "message" in err && typeof (err as { message: unknown }).message === "string"
      ? (err as { message: string }).message
      : "Something went wrong. Please try again.";
  return message.includes("not configured") ? NOT_CONFIGURED_MESSAGE : message;
}

export function AuthForm({ onSuccess, renderHeader }: AuthFormProps) {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const modeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const id = useId();
  const nameId = `${id}-name`;
  const emailId = `${id}-email`;
  const passwordId = `${id}-password`;

  useEffect(() => {
    return () => {
      if (modeTimer.current) clearTimeout(modeTimer.current);
    };
  }, []);

  const copy = COPY[mode];

  const switchMode = (next: AuthMode) => {
    if (modeTimer.current) clearTimeout(modeTimer.current);
    setMode(next);
    setError(null);
    setNotice(null);
  };

  // Profile rows are ensured by the auth bootstrap (lib/store fetchUser) after the
  // SIGNED_IN event, and by the database trigger, so the form only talks to auth.
  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
            },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.session) {
          // Email confirmation is off: the user is signed in already.
          onSuccess?.();
        } else if (data?.user) {
          setNotice("Check your email to confirm your account.");
          modeTimer.current = setTimeout(() => {
            setMode("signin");
            setNotice(null);
          }, 3000);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        onSuccess?.();
      }
    } catch (err) {
      setError(errorText(err));
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);
    setNotice(null);

    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (oauthError) throw oauthError;
      // The browser now redirects to the provider; the profile is ensured after sign-in.
    } catch (err) {
      setError(errorText(err));
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {renderHeader ? (
        renderHeader({ title: copy.title, description: copy.description })
      ) : (
        <div className="space-y-1.5">
          <h2 className="type-section text-foreground">{copy.title}</h2>
          <p className="text-sm text-muted-foreground">{copy.description}</p>
        </div>
      )}

      {error ? (
        <p
          role="alert"
          className="rounded-panel border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
      {notice ? (
        <p
          role="status"
          className="rounded-panel border border-success/40 bg-success/10 px-4 py-3 text-sm text-success"
        >
          {notice}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => handleOAuthSignIn("google")}
        disabled={loading}
        className={cn(
          "inline-flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-input bg-card px-5 text-sm font-medium text-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-accent active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
          focusRing,
        )}
      >
        <GoogleLogo size={20} aria-hidden="true" />
        Continue with Google
      </button>

      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-border" />
        <span className="text-[13px] text-subtle-foreground">or use email</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" ? (
          <div className="space-y-2">
            <label htmlFor={nameId} className={labelClass}>
              Full name
            </label>
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
              required
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <label htmlFor={emailId} className={labelClass}>
            Email
          </label>
          <input
            id={emailId}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div className="space-y-2">
          <label htmlFor={passwordId} className={labelClass}>
            Password
          </label>
          <div className="relative">
            <input
              id={passwordId}
              type={showPassword ? "text" : "password"}
              autoComplete={mode === "signin" ? "current-password" : "new-password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(inputClass, "pr-14")}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              aria-controls={passwordId}
              className={cn(
                "absolute right-0.5 top-1/2 inline-flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-foreground",
                focusRing,
              )}
            >
              {showPassword ? (
                <EyeSlash size={20} aria-hidden="true" />
              ) : (
                <Eye size={20} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          aria-busy={loading || undefined}
          className={cn(
            "inline-flex h-12 w-full items-center justify-center rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-[background-color,transform] duration-150 ease-out hover:bg-primary-hover active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60",
            focusRing,
          )}
        >
          {loading ? copy.pending : copy.submit}
        </button>
      </form>

      <p className="text-sm text-muted-foreground">
        {mode === "signin" ? "Don't have an account? " : "Already have an account? "}
        <button
          type="button"
          onClick={() => switchMode(mode === "signin" ? "signup" : "signin")}
          className={cn(
            "inline-flex min-h-11 items-center rounded-full px-1 font-medium text-primary underline-offset-4 hover:underline disabled:opacity-60 md:min-h-0",
            focusRing,
          )}
          disabled={loading}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
