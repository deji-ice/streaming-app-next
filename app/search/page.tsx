"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import MediaCard from "@/components/media/MediaCard";
import { toast } from "sonner";

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date?: string;
  first_air_date?: string;
  vote_average: number;
  media_type: "movie" | "tv";
}

interface SearchResponse {
  results: SearchResult[];
  page: number;
  total_pages: number;
  total_results: number;
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [type, setType] = useState<"" | "movie" | "tv">(
    (searchParams.get("type") as "movie" | "tv") || "",
  );
  const [year, setYear] = useState(searchParams.get("year") || "");
  const [minRating, setMinRating] = useState(
    searchParams.get("minRating") || "",
  );
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const performSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setTotalResults(0);
        return;
      }

      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("q", q);
        if (type) params.append("type", type);
        if (year) params.append("year", year);
        if (minRating) params.append("minRating", minRating);

        const response = await fetch(`/api/search?${params}`);
        const data: SearchResponse = await response.json();

        setResults(data.results || []);
        setTotalResults(data.total_results || 0);
      } catch (error) {
        toast.error("Failed to search");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    },
    [type, year, minRating],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        performSearch(query);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  const handleClearFilters = () => {
    setType("");
    setYear("");
    setMinRating("");
  };

  const hasActiveFilters = type || year || minRating;

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-10">
      <div className="container mx-auto px-4">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-montserrat font-bold mb-4">
            Search
          </h1>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies and series..."
              className="pl-10 pr-4 py-2.5 text-base"
              autoFocus
            />
          </div>

          {/* Filter Toggle */}
          <Button
            onClick={() => setShowFilters(!showFilters)}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-card border border-border rounded-lg p-6 mb-8">
            <div className="grid md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className="text-sm font-medium block mb-2">Type</label>
                <select
                  value={type}
                  onChange={(e) =>
                    setType(e.target.value as "" | "movie" | "tv")
                  }
                  className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">All Types</option>
                  <option value="movie">Movies</option>
                  <option value="tv">Series</option>
                </select>
              </div>

              {/* Year Filter */}
              <div>
                <label className="text-sm font-medium block mb-2">Year</label>
                <Input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g., 2024"
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-sm font-medium block mb-2">
                  Min Rating
                </label>
                <Input
                  type="number"
                  value={minRating}
                  onChange={(e) => setMinRating(e.target.value)}
                  placeholder="e.g., 7.5"
                  min="0"
                  max="10"
                  step="0.1"
                />
              </div>

              {/* Clear Button */}
              <div className="flex items-end">
                {hasActiveFilters && (
                  <Button
                    onClick={handleClearFilters}
                    variant="ghost"
                    size="sm"
                    className="w-full gap-2"
                  >
                    <X className="w-4 h-4" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {query.trim().length < 2 ? (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Enter at least 2 characters to search
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              No results found {hasActiveFilters && "with the selected filters"}
            </p>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground mb-6">
              Found {totalResults} result{totalResults !== 1 ? "s" : ""}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {results.map((item) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  item={item as any}
                  type={item.media_type}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen pt-20 md:pt-24 pb-10">
          <div className="container mx-auto px-4">
            <p className="text-muted-foreground">Loading search...</p>
          </div>
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
