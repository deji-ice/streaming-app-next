"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import {
  Sun,
  Moon,
  Search,
  User,
  Menu,
  X,
  Film,
  Tv,
  Home,
  TrendingUp,
  Clock,
  Heart,
  Info,
} from "lucide-react";
import { useState } from "react";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useScrollPosition } from "@/hooks/useScrollPosition";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useBodyLock } from "@/hooks/useBodyLock";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use custom hooks instead of separate useEffects
  const scrolled = useScrollPosition(20);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  useBodyLock(mobileMenuOpen);

  // Close mobile menu when screen size becomes desktop
  if (isDesktop && mobileMenuOpen) {
    setMobileMenuOpen(false);
  }

  return (
    <>
      <nav
        className={cn(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
          scrolled
            ? "mt-2 sm:mt-3 md:mt-4 mx-2 sm:mx-4 md:mx-8 rounded-xl sm:rounded-2xl backdrop-blur-sm bg-background/50 border shadow-lg"
            : "bg-gradient-to-b from-black/80 to-transparent"
        )}
      >
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex h-12 sm:h-14 md:h-16 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <span
                className={cn(
                  "font-montserrat font-bold text-base sm:text-lg md:text-xl",
                  scrolled
                    ? "text-slate-900 relative z-[41] dark:text-white"
                    : "text-white"
                )}
              >
                StreamScape
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link
                href="/movie"
                className={cn(
                  "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
              >
                <Film className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Movies</span>
              </Link>
              <Link
                href="/series"
                className={cn(
                  "px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
              >
                <Tv className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>Series</span>
              </Link>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                className={cn(
                  "p-1.5 sm:p-2 hover:bg-white/10 md:block hidden rounded-full",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                aria-label="Toggle theme"
              >
                {theme === "dark" ? (
                  <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>

              <button
                onClick={() => setSearchOpen(true)}
                className={cn(
                  "p-1.5 sm:p-2 hover:bg-white/10 rounded-full",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              <Link
                href="/profile"
                className={cn(
                  "p-1.5 sm:p-2 hover:bg-white/10 md:block hidden rounded-full",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
                aria-label="Profile"
              >
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={cn(
                  "p-1.5 sm:p-2 hover:bg-white/10 rounded-full md:hidden",
                  scrolled ? "text-slate-900 dark:text-white" : "text-white"
                )}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileMenuOpen}
              >
                {mobileMenuOpen ? (
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                ) : (
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu with responsive sizing */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              className="fixed inset-0 z-40 rounded-xl sm:rounded-2xl md:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <motion.div
                className="fixed inset-y-0 right-0 w-full max-w-xs sm:max-w-sm rounded-t-xl sm:rounded-t-2xl bg-white dark:bg-gray-900 border-l shadow-xl"
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-4 sm:p-5 w-full h-screen bg-inherit rounded-t-xl sm:rounded-t-2xl">
                  <div className="flex justify-end w-full items-center mb-6 sm:mb-8">
                    <button
                      className="p-1.5 sm:p-2 rounded-full hover:bg-accent/50"
                      onClick={() => setMobileMenuOpen(false)}
                      aria-label="Close menu"
                    >
                      <X className="h-4 w-4 sm:h-5 sm:w-5" />
                    </button>
                  </div>

                  <nav className="space-y-0.5 sm:space-y-1">
                    <Link
                      href="/"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Home className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Home</span>
                    </Link>

                    <Link
                      href="/movie"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Film className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Movies</span>
                    </Link>

                    <Link
                      href="/series"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Tv className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Series</span>
                    </Link>

                    <Link
                      href="/trending"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Trending</span>
                    </Link>

                    <Link
                      href="/watchlist"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Watchlist</span>
                    </Link>

                    <Link
                      href="/recent"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">Recently Watched</span>
                    </Link>

                    <Link
                      href="/about"
                      className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg hover:bg-accent/50 transition-colors text-sm sm:text-base"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Info className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="font-medium">About</span>
                    </Link>
                  </nav>

                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t">
                    <div className="flex justify-between items-center px-3 sm:px-4">
                      <span className="font-medium text-sm sm:text-base">
                        Theme
                      </span>
                      <button
                        onClick={() =>
                          setTheme(theme === "dark" ? "light" : "dark")
                        }
                        className="p-1.5 sm:p-2 rounded-full hover:bg-accent/50"
                        aria-label="Toggle theme"
                      >
                        {theme === "dark" ? (
                          <Moon className="h-4 w-4 sm:h-5 sm:w-5" />
                        ) : (
                          <Sun className="h-4 w-4 sm:h-5 sm:w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
