"use client";

import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import {
  Search,
  X,
  Film,
  Tv,
  Star,
  Clock,
  TrendingUp,
  History,
  Command,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Movie, Series } from "@/types";
import Image from "next/image";
import Link from "next/link";
import { sluggify, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;

type FilterTab = "all" | "movies" | "series";

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | Series)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 400);
  const prefersReducedMotion = useMediaQuery(
    "(prefers-reduced-motion: reduce)",
  );

  // GSAP cleanup on unmount
  useEffect(() => {
    return () => {
      if (backdropRef.current) gsap.killTweensOf(backdropRef.current);
      if (modalRef.current) gsap.killTweensOf(modalRef.current);
    };
  }, []);

  // GSAP modal animations — compositor-only (opacity + scale)
  useEffect(() => {
    if (isOpen && backdropRef.current && modalRef.current) {
      // Reduced motion: instant state
      if (prefersReducedMotion) {
        gsap.set(backdropRef.current, { opacity: 1 });
        gsap.set(modalRef.current, { scale: 1, opacity: 1 });
        return;
      }

      // Entrance animation with will-change
      gsap.set(backdropRef.current, { willChange: "opacity" });
      gsap.set(modalRef.current, { willChange: "transform, opacity" });

      gsap.fromTo(
        backdropRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
          clearProps: "willChange",
        },
      );
      gsap.fromTo(
        modalRef.current,
        { scale: 0.95, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.2,
          ease: "power2.out",
          clearProps: "willChange",
        },
      );
    }
  }, [isOpen, prefersReducedMotion]);

  const handleClose = () => {
    if (backdropRef.current && modalRef.current) {
      // Reduced motion: instant close
      if (prefersReducedMotion) {
        onClose();
        return;
      }

      // Exit animation with will-change
      gsap.set(backdropRef.current, { willChange: "opacity" });
      gsap.set(modalRef.current, { willChange: "transform, opacity" });

      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set([backdropRef.current, modalRef.current], {
            willChange: "auto",
          });
          onClose();
        },
      });
      tl.to(modalRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 0.15,
        ease: "power2.in",
      });
      tl.to(
        backdropRef.current,
        { opacity: 0, duration: 0.15, ease: "power2.in" },
        "-=0.1",
      );
    } else {
      onClose();
    }
  };

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse recent searches", e);
      }
    }
  }, []);

  // Save recent search
  const saveRecentSearch = (term: string) => {
    if (term.trim().length < 3) return;

    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== term);
      const updated = [term, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  // Apply search term from recent searches
  const applySearchTerm = (term: string) => {
    setQuery(term);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  useEffect(() => {
    if (debouncedQuery.length > 2) {
      setIsLoading(true);
      // Use API route instead of direct TMDB client call
      fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`)
        .then((res) => res.json())
        .then((data) => {
          const filteredResults = data.results.filter(
            (item: Movie | Series) => {
              const isMovie = "title" in item;
              const isSeries = "name" in item;

              if (activeTab === "movies") return isMovie;
              if (activeTab === "series") return isSeries;
              return true; // All results
            },
          );

          setResults(filteredResults);
        })
        .catch((error) => {
          console.error("Search error:", error);
          setResults([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery, activeTab]);

  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      // Store the original overflow value
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;

      // Calculate scroll bar width to prevent layout shift
      const scrollBarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      // Lock the body scroll
      document.body.style.overflow = "hidden";

      // Add padding right to prevent content shift when scrollbar disappears
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }

      return () => {
        // Restore original values when component unmounts or modal closes
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [isOpen]);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };

    if (isOpen && searchInputRef.current) {
      // Focus input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onClose, isOpen]);

  const handleItemClick = () => {
    saveRecentSearch(query);
    onClose();
  };

  // Get filtered counts
  const movieCount = results.filter((item) => "title" in item).length;
  const seriesCount = results.filter((item) => "name" in item).length;

  return (
    <>
      {isOpen && (
        <div
          ref={backdropRef}
          className="fixed inset-0 bg-background/80 font-montserrat backdrop-blur-sm z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className="container mx-auto max-w-2xl px-4 pt-20">
            <div
              ref={modalRef}
              className="bg-card rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Search Input */}
              <div className="flex items-center gap-1.5 lg:gap-3 px-5 py-2 border-b">
                <Search
                  className={cn(
                    "w-5 h-5 flex-shrink-0 transition-all",
                    isLoading
                      ? "text-primary animate-pulse"
                      : "text-muted-foreground",
                  )}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="What do you want to watch today?"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="w-full bg-transparent border-none  focus:ring-0  placeholder:border-none focus:outline-none text-sm lg:text-base placeholder:text-muted-foreground"
                  autoComplete="off"
                />
                {query ? (
                  <button
                    onClick={() => setQuery("")}
                    className="p-1.5 hover:bg-accent rounded-full transition-colors"
                    aria-label="Clear search"
                  >
                    <X className="w-4 h-4 text-muted-foreground" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-muted-foreground bg-muted rounded border">
                    <Command className="w-3 h-3" />K
                  </kbd>
                )}
              </div>

              {/* Content Area */}
              <div className="max-h-[60vh] overflow-y-auto">
                {/* Recent Searches - Show when no query */}
                {!query && recentSearches.length > 0 && (
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                        <History className="w-4 h-4" />
                        Recent Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs h-7"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((term) => (
                        <Badge
                          key={term}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent transition-colors"
                          onClick={() => applySearchTerm(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Filter Tabs - Show when there's a query */}
                {query && (
                  <div className="px-5 pt-4 pb-3 flex gap-2 border-b">
                    <button
                      onClick={() => setActiveTab("all")}
                      className={cn(
                        "px-3 py-0.5 rounded-full text-sm font-medium transition-colors",
                        activeTab === "all"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setActiveTab("movies")}
                      className={cn(
                        "px-3 py-0.5 rounded-full text-sm font-medium transition-colors",
                        activeTab === "movies"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Movies {movieCount > 0 && `(${movieCount})`}
                    </button>
                    <button
                      onClick={() => setActiveTab("series")}
                      className={cn(
                        "px-3 py-0.5 rounded-full text-sm font-medium transition-colors",
                        activeTab === "series"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted/50 text-muted-foreground hover:bg-muted",
                      )}
                    >
                      Series {seriesCount > 0 && `(${seriesCount})`}
                    </button>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && query && (
                  <div className="px-5 py-3 space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Skeleton className="w-12 h-16 rounded" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-40" />
                          <Skeleton className="h-3 w-24" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results */}
                {!isLoading && query && (
                  <>
                    {results.length > 0 ? (
                      <div className="pb-3">
                        {results.map((item) => {
                          const isMovie = "title" in item;
                          const title = isMovie
                            ? item.title
                            : (item as Series).name;
                          const releaseDate = isMovie
                            ? (item as Movie).release_date
                            : (item as Series).first_air_date;
                          const year = releaseDate
                            ? new Date(releaseDate).getFullYear()
                            : null;
                          const rating = item.vote_average
                            ? Math.round(item.vote_average * 10) / 10
                            : null;
                          const slug = `${sluggify(title)}-${item.id}`;
                          const posterPath =
                            item.poster_path || "/placeholder-poster.jpg";
                          const href = isMovie
                            ? `/movie/${slug}`
                            : `/series/${slug}`;

                          return (
                            <Link
                              key={item.id}
                              href={href}
                              onClick={handleItemClick}
                              className="flex items-center gap-3 px-5 py-3 hover:bg-accent/50 transition-colors group"
                            >
                              <div className="relative overflow-hidden rounded-md flex-shrink-0">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w92${posterPath}`}
                                  alt={title}
                                  width={48}
                                  height={72}
                                  className="object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold group-hover:text-primary transition-colors truncate">
                                  {title}
                                </h3>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    {isMovie ? (
                                      <Film className="w-3 h-3" />
                                    ) : (
                                      <Tv className="w-3 h-3" />
                                    )}
                                    {isMovie ? "Movie" : "Series"}
                                  </span>
                                  {year && (
                                    <>
                                      <span>•</span>
                                      <span>{year}</span>
                                    </>
                                  )}
                                  {rating && (
                                    <>
                                      <span>•</span>
                                      <span className="flex items-center gap-1">
                                        <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                        {rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                            </Link>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-12 text-center px-5">
                        <div className="bg-muted/30 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                          <Search className="w-8 h-8 text-muted-foreground/50" />
                        </div>
                        <h3 className="text-base font-medium mb-1">
                          No results found
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Try different keywords or filters
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
