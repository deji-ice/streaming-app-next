"use client";

import { useState } from "react";
import { Mail, Lock, User, Eye, EyeOff, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

interface AuthFormProps {
  onSuccess?: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "signup") {
        // Sign up with Supabase
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

        if (data.user) {
          setError("Check your email to confirm your account!");
          setTimeout(() => {
            setMode("signin");
            setError(null);
          }, 3000);
        }
      } else {
        // Sign in with Supabase
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        onSuccess?.();
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message || "An error occurred";
      if (message.includes("not configured")) {
        setError(
          "⚠️ Supabase not configured. Please set environment variables in .env.local (see PHASE2-SETUP.md)",
        );
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignIn = async (provider: "google" | "github") => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      const message = err?.message || "An error occurred";
      if (message.includes("not configured")) {
        setError(
          "⚠️ Supabase not configured. Please set environment variables in .env.local (see PHASE2-SETUP.md)",
        );
      } else {
        setError(message);
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-bold font-montserrat">
          {mode === "signin" ? "Welcome Back" : "Create Account"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {mode === "signin"
            ? "Sign in to access your watchlist and continue watching"
            : "Sign up to start building your personalized streaming experience"}
        </p>
      </div>

      {/* Error message */}
      {error && (
        <div
          className={cn(
            "p-3 rounded-lg text-sm text-center",
            error.includes("Check your email")
              ? "bg-green-500/10 text-green-500 border border-green-500/20"
              : "bg-destructive/10 text-destructive border border-destructive/20",
          )}
        >
          {error}
        </div>
      )}

      {/* OAuth buttons */}
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-sm"
          onClick={() => handleOAuthSignIn("google")}
          disabled={loading}
        >
          <Chrome className="w-4 h-4" />
          Continue with Google
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full gap-2 bg-white/5 hover:bg-white/10 border-white/10 backdrop-blur-sm"
          onClick={() => handleOAuthSignIn("github")}
          disabled={loading}
        >
          <Github className="w-4 h-4" />
          Continue with GitHub
        </Button>
      </div>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-white/10" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-transparent px-2 text-muted-foreground backdrop-blur-sm">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Email/Password form */}
      <form onSubmit={handleEmailAuth} className="space-y-4">
        {mode === "signup" && (
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="pl-10 bg-white/5 border-white/10 backdrop-blur-sm"
                required={mode === "signup"}
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 backdrop-blur-sm"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium">
            Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 pr-10 bg-white/5 border-white/10 backdrop-blur-sm"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-primary hover:bg-primary/90"
          disabled={loading}
        >
          {loading
            ? "Loading..."
            : mode === "signin"
              ? "Sign In"
              : "Create Account"}
        </Button>
      </form>

      {/* Toggle mode */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">
          {mode === "signin"
            ? "Don't have an account? "
            : "Already have an account? "}
        </span>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "signin" ? "signup" : "signin");
            setError(null);
          }}
          className="text-primary hover:underline font-medium"
          disabled={loading}
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </div>
    </div>
  );
}
