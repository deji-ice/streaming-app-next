"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import MediaCard from "@/components/media/MediaCard";
import { Genre, SeriesDetails } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SeriesClientPageProps {
  initialSeries: SeriesDetails[];
  sortOptions: { value: string; label: string }[];
  currentSort: string;
  currentPage: number;
  totalPages: number;
  genres: Genre[];
}

export default function SeriesClientPage({
  initialSeries,
  sortOptions,
  currentSort,
  currentPage,
  totalPages,
  genres,
}: SeriesClientPageProps) {
  const [series, setSeries] = useState<SeriesDetails[]>(initialSeries);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [localPage, setLocalPage] = useState(currentPage);
  const [localSort, setLocalSort] = useState(currentSort);

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Filter series by selected genres
  const filteredSeries =
    selectedGenres.length > 0
      ? series.filter((show) =>
          show.genre_ids.some((id) => selectedGenres.includes(id))
        )
      : series;

  // Update URL with sort and page params
  const updateUrl = (
    sort: string,
    page: number,
    genreIds: number[] = selectedGenres
  ) => {
    setIsLoading(true);
    const params = new URLSearchParams(searchParams.toString());
    params.set("sort", sort);
    params.set("page", page.toString());

    if (genreIds.length > 0) {
      params.set("genres", genreIds.join(","));
    } else {
      params.delete("genres");
    }

    // Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Handle sort change
  const handleSortChange = (value: string) => {
    setLocalSort(value);
    updateUrl(value, 1); // Reset to page 1 when sort changes
  };

  // Handle genre selection
  const toggleGenre = (genreId: number) => {
    const newSelectedGenres = selectedGenres.includes(genreId)
      ? selectedGenres.filter((id) => id !== genreId)
      : [...selectedGenres, genreId];

    setSelectedGenres(newSelectedGenres);
    updateUrl(localSort, 1, newSelectedGenres); // Reset to page 1 when changing genre filters
  };

  // Clear all selected genres
  const clearGenres = () => {
    setSelectedGenres([]);
    updateUrl(localSort, 1, []);
  };

  // Fetch new data when URL parameters change
  useEffect(() => {
    const fetchSeries = async () => {
      try {
        const sort = searchParams.get("sort") || "popularity.desc";
        const page = parseInt(searchParams.get("page") || "1", 10);

        setLocalSort(sort);
        setLocalPage(page);

        let endpoint;
        switch (sort) {
          case "first_air_date.desc":
            endpoint = "on_the_air";
            break;
          case "vote_average.desc":
            endpoint = "top_rated";
            break;
          case "popularity.desc":
          default:
            endpoint = "popular";
            break;
        }

        const res = await fetch(
          `/api/series?endpoint=${endpoint}&page=${page}`,
          { cache: "no-store" }
        );

        if (!res.ok) throw new Error("Failed to fetch series");

        const data = await res.json();
        setSeries(data.results);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching series:", error);
        setIsLoading(false);
      }
    };
  }, [searchParams]);

  useEffect(() => {
    const genresParam = searchParams.get("genres");
    if (genresParam) {
      const genreIds = genresParam.split(",").map((id) => parseInt(id, 10));
      setSelectedGenres(genreIds);
    } else {
      setSelectedGenres([]);
    }
  }, [searchParams]);

  const getPaginationRange = () => {
    const maxPages = 5;
    let start = Math.max(1, localPage - Math.floor(maxPages / 2));
    const end = Math.min(totalPages, start + maxPages - 1);

    // Adjust start if end is capped
    if (end - start + 1 < maxPages) {
      start = Math.max(1, end - maxPages + 1);
    }

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <div className="space-y-8">
      {/* Filters and Sorting */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
        <div className="flex flex-col w-full md:w-auto">
          <h2 className="text-lg font-medium mb-2">Sort By</h2>
          <Select value={localSort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort Options</SelectLabel>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        {/* Genre Filter */}
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-medium">Filter by Genre</h2>
            {selectedGenres.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearGenres}
                className="text-xs"
              >
                Clear All
              </Button>
            )}
          </div>
          <div className="flex flex-wrap gap-2 max-w-[500px]">
            {genres.slice(0, 8).map((genre) => (
              <Badge
                key={genre.id}
                variant={
                  selectedGenres.includes(genre.id) ? "default" : "outline"
                }
                className={cn(
                  "cursor-pointer",
                  selectedGenres.includes(genre.id)
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent"
                )}
                onClick={() => toggleGenre(genre.id)}
              >
                {genre.name}
                {selectedGenres.includes(genre.id) && (
                  <X className="ml-1 h-3 w-3" />
                )}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content or Loading state */}
      <div
        className={cn(
          "transition-opacity duration-300",
          isLoading ? "opacity-50" : ""
        )}
      >
        {filteredSeries.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">
              No series match your filter
            </h3>
            <p className="text-muted-foreground mb-4">
              Try changing your genre selection or sort option
            </p>
            <Button onClick={clearGenres}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {filteredSeries.map((show) => (
              <MediaCard key={show.id} item={show} type="series" />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => updateUrl(localSort, Math.max(1, localPage - 1))}
                aria-disabled={localPage === 1}
                className={
                  localPage === 1
                    ? "cursor-pointer opacity-50"
                    : " cursor-pointer"
                }
              />
            </PaginationItem>

            {localPage > 3 && (
              <PaginationItem>
                <PaginationLink onClick={() => updateUrl(localSort, 1)}>
                  1
                </PaginationLink>
              </PaginationItem>
            )}

            {getPaginationRange().map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => updateUrl(localSort, page)}
                  className={
                    localPage === page
                      ? "bg-primary cursor-pointer text-primary-foreground"
                      : " cursor-pointer"
                  }
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {localPage < totalPages - 2 && (
              <>
                <PaginationItem>
                  <PaginationLink
                    onClick={() =>
                      updateUrl(localSort, Math.min(totalPages, localPage + 1))
                    }
                    aria-disabled={localPage === totalPages}
                    className={
                      localPage === totalPages
                        ? " cursor-pointer opacity-50"
                        : " cursor-pointer"
                    }
                  >
                    Next
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink
                    onClick={() => updateUrl(localSort, totalPages)}
                    className=" cursor-pointer"
                    title="last"
                  >
                    {">>"}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
