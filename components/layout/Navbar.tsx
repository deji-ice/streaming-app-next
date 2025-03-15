"use client";
import Link from "next/link";
import { useTheme } from "next-themes";
import { Sun, Moon, Search, User, Menu, X, Film, Tv } from "lucide-react";
import { useState, useEffect } from "react";
import { SearchModal } from "./SearchModal";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const { theme, setTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect for floating navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "mt-4 mx-4 md:mx-8 rounded-2xl backdrop-blur-sm bg-background/50 border shadow-lg"
          : "bg-gradient-to-b from-black/80 to-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span
              className={cn(
                "font-montserrat font-bold text-xl",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
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
                "px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </Link>
            <Link
              href="/series"
              className={cn(
                "px-4 py-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
            >
              <Tv className="w-4 h-4" />
              <span>Series</span>
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className={cn(
                "p-2 hover:bg-white/10 rounded-full",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label="Toggle theme"
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>

            <button
              onClick={() => setSearchOpen(true)}
              className={cn(
                "p-2 hover:bg-white/10 rounded-full",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link
              href="/profile"
              className={cn(
                "p-2 hover:bg-white/10 rounded-full",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
              aria-label="Profile"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "p-2 hover:bg-white/10 rounded-full md:hidden",
                scrolled ? "text-slate-800 dark:text-white" : "text-white"
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-background/90 backdrop-blur-md border-t">
          <div className="container mx-auto px-4 py-3 space-y-1">
            <Link
              href="/movie"
              className=" px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Film className="w-4 h-4" />
              <span>Movies</span>
            </Link>
            <Link
              href="/series"
              className=" px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors flex items-center gap-2"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Tv className="w-4 h-4" />
              <span>Series</span>
            </Link>
          </div>
        </div>
      )}

      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
