"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Film,
  Tv,
  Star,
  Clock,
  TrendingUp,
  History,
} from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { Movie, Series } from "@/types";
import { tmdb } from "@/lib/tmdb";
import Image from "next/image";
import Link from "next/link";
import { sluggify, cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RECENT_SEARCHES_KEY = "recent-searches";
const MAX_RECENT_SEARCHES = 5;

// Animation variants
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2 } },
  exit: { opacity: 0, transition: { duration: 0.2, delay: 0.1 } },
};

const modalVariants = {
  hidden: { y: -20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.3, ease: "easeOut" } },
  exit: { y: -20, opacity: 0, transition: { duration: 0.2 } },
};

const resultItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.05, duration: 0.3 },
  }),
};

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<(Movie | Series)[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [tabIndex, setTabIndex] = useState(0); // 0: All, 1: Movies, 2: Series
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debouncedQuery = useDebounce(query, 400);

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
      tmdb
        .searchMulti(debouncedQuery)
        .then((data) => {
          const filteredResults = data.results.filter((item) => {
            const isMovie = "title" in item;
            const isSeries = "name" in item;

            if (tabIndex === 1) return isMovie;
            if (tabIndex === 2) return isSeries;
            return true; // All results for index 0
          });

          setResults(filteredResults);
        })
        .finally(() => setIsLoading(false));
    } else {
      setResults([]);
    }
  }, [debouncedQuery, tabIndex]);

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
      if (e.key === "Escape") onClose();
    };

    if (isOpen && searchInputRef.current) {
      // Focus input when modal opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [onClose, isOpen]);

  const handleItemClick = () => {
    saveRecentSearch(query);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <div className="container mx-auto max-w-3xl px-2 sm:px-4">
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-12 sm:mt-16 md:mt-20 bg-card/90 backdrop-blur-md rounded-xl sm:rounded-2xl overflow-hidden border shadow-xl"
            >
              {/* Header section */}
              <div className="p-3 sm:p-4 md:p-6 pb-2 sm:pb-3 md:pb-4 border-b">
                <div className="relative flex items-center gap-2 sm:gap-3 rounded-full bg-muted/50 px-3 sm:px-4 py-1.5 sm:py-2 ring-1 ring-border">
                  <Search
                    className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 transition-all",
                      isLoading
                        ? "text-primary animate-pulse"
                        : "text-muted-foreground"
                    )}
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search for movies, TV shows, and more..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-transparent border-none outline-none text-sm sm:text-base md:text-lg"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      className="p-1 hover:bg-accent rounded-full"
                      aria-label="Clear search"
                    >
                      <X className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

                {/* Tabs */}
                <Tabs
                  value={String(tabIndex)}
                  onValueChange={(value) => setTabIndex(Number(value))}
                  className="mt-3 sm:mt-4"
                >
                  <TabsList className="h-8 sm:h-9 text-xs sm:text-sm">
                    <TabsTrigger value="0">All</TabsTrigger>
                    <TabsTrigger value="1">Movies</TabsTrigger>
                    <TabsTrigger value="2">Series</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Results section */}
              <div className="p-2 max-h-[50vh] sm:max-h-[55vh] md:max-h-[60vh] overflow-y-auto">
                {/* Recent searches section */}
                {query.length === 0 && recentSearches.length > 0 && (
                  <div className="mb-3 sm:mb-4 p-2 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground flex items-center gap-1.5 sm:gap-2">
                        <History className="w-3 h-3 sm:w-4 sm:h-4" /> Recent
                        Searches
                      </h3>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearRecentSearches}
                        className="text-xs h-7 sm:h-8"
                      >
                        Clear All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      {recentSearches.map((term) => (
                        <Badge
                          key={term}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent transition-colors text-xs"
                          onClick={() => applySearchTerm(term)}
                        >
                          {term}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Loading state */}
                {isLoading && (
                  <div className="space-y-2 sm:space-y-3 p-2">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3"
                      >
                        <Skeleton className="w-10 h-14 sm:w-12 sm:h-16 rounded" />
                        <div className="space-y-1.5 sm:space-y-2">
                          <Skeleton className="h-3 sm:h-4 w-28 sm:w-40" />
                          <Skeleton className="h-2 sm:h-3 w-16 sm:w-20" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Results */}
                {!isLoading && (
                  <div className="divide-y divide-border/30">
                    <AnimatePresence mode="wait">
                      {results.map((item, i) => {
                        const title = "title" in item ? item.title : item.name;
                        const type = "title" in item ? "movie" : "series";
                        const releaseDate =
                          "release_date" in item
                            ? item.release_date
                            : item.first_air_date;
                        const year = releaseDate
                          ? new Date(releaseDate).getFullYear()
                          : null;
                        const rating = item.vote_average
                          ? Math.round(item.vote_average * 10) / 10
                          : null;
                        const slug = `${sluggify(title)}-${item.id}`;
                        const posterPath =
                          item.poster_path || "/placeholder-poster.jpg";

                        return (
                          <motion.div
                            key={item.id}
                            custom={i}
                            variants={resultItemVariants}
                            initial="hidden"
                            animate="visible"
                          >
                            <Link
                              href={`/${type}/${slug}`}
                              onClick={handleItemClick}
                              className="flex items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-accent/30 transition-colors group"
                            >
                              <div className="relative overflow-hidden rounded-md">
                                <Image
                                  src={`https://image.tmdb.org/t/p/w92${posterPath}`}
                                  alt={title}
                                  width={40}
                                  height={60}
                                  className="group-hover:scale-105 transition-transform duration-300 object-cover sm:w-[48px] sm:h-[72px]"
                                />
                                <div className="absolute top-0 right-0 bottom-0 left-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-1">
                                  <div className="text-white text-[10px] sm:text-xs font-medium">
                                    View
                                  </div>
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-montserrat font-semibold group-hover:text-primary transition-colors truncate text-sm sm:text-base">
                                  {title}
                                </h3>
                                <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1">
                                  {type === "movie" ? (
                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                      <Film className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                                      Movie
                                    </span>
                                  ) : (
                                    <span className="flex items-center gap-0.5 sm:gap-1">
                                      <Tv className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                                      Series
                                    </span>
                                  )}
                                  {year && (
                                    <>
                                      <span className="text-muted-foreground/50">
                                        •
                                      </span>
                                      <span className="flex items-center gap-0.5 sm:gap-1">
                                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />{" "}
                                        {year}
                                      </span>
                                    </>
                                  )}
                                  {rating && (
                                    <>
                                      <span className="text-muted-foreground/50">
                                        •
                                      </span>
                                      <span className="flex items-center gap-0.5 sm:gap-1">
                                        <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-yellow-500" />{" "}
                                        {rating}
                                      </span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {item?.popularity > 50 && (
                                <Badge
                                  variant="outline"
                                  className="bg-primary/10 text-primary text-[10px] sm:text-xs hidden xs:inline-flex"
                                >
                                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />{" "}
                                  Trending
                                </Badge>
                              )}
                            </Link>
                          </motion.div>
                        );
                      })}

                      {query.length > 2 &&
                        results.length === 0 &&
                        !isLoading && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-10 sm:py-16 text-center"
                          >
                            <div className="bg-muted/30 rounded-full w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center mx-auto mb-3 sm:mb-4">
                              <Search className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                            </div>
                            <h3 className="text-base sm:text-lg font-montserrat font-medium mb-1">
                              No results found
                            </h3>
                            <p className="text-xs sm:text-sm text-muted-foreground px-4">
                              Try adjusting your search or filter to find what
                              you&apos;re looking for
                            </p>
                          </motion.div>
                        )}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t p-2 sm:p-3 md:p-4 flex justify-between items-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Search powered by TMDB
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClose}
                  className="h-7 sm:h-8 text-xs sm:text-sm"
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
