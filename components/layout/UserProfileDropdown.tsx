"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { User, LogOut, Settings, Heart, Clock } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface UserProfileDropdownProps {
  scrolled: boolean;
  onAuthModalOpen: () => void;
}

export function UserProfileDropdown({
  scrolled,
  onAuthModalOpen,
}: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, isLoading } = useUser();
  console.log("user", user);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <div className="p-1.5 sm:p-2 rounded-full">
        <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <button
        onClick={onAuthModalOpen}
        className={cn(
          "p-1.5 sm:p-2 hover:bg-white/10 rounded-full transition-colors",
          scrolled ? "text-slate-900 dark:text-white" : "text-white",
        )}
        aria-label="Sign in"
      >
        <User className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "p-1 rounded-full hover:ring-2 hover:ring-primary/50 transition-all",
          scrolled ? "text-slate-900 dark:text-white" : "text-white",
        )}
        aria-label="User menu"
        aria-expanded={isOpen}
      >
        <Avatar className="w-7 h-7 sm:w-8 sm:h-8">
          <AvatarImage
            src={user?.image || undefined}
            alt={user?.name || "User"}
          />
          <AvatarFallback className="bg-primary/20 text-primary">
            {user?.name?.charAt(0).toUpperCase() ||
              user?.email?.charAt(0).toUpperCase() ||
              "U"}
          </AvatarFallback>
        </Avatar>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            {/* Dropdown */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="absolute right-0 mt-2 w-56 sm:w-64 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden z-50"
            >
              {/* User Info */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-br from-primary/5 to-transparent">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage
                      src={user?.image || undefined}
                      alt={user?.name || "User"}
                    />
                    <AvatarFallback className="bg-primary/20 text-primary">
                      {user?.name?.charAt(0).toUpperCase() ||
                        user?.email?.charAt(0).toUpperCase() ||
                        "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {user?.name || "User"}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                <Link
                  href="/profile"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Profile</span>
                </Link>

                <Link
                  href="/watchlist"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Heart className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Watchlist</span>
                </Link>

                <Link
                  href="/history"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Watch History</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <Settings className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Settings</span>
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 dark:border-gray-800 py-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 px-4 py-2.5 w-full hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-red-600 dark:text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
