"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaGrid from "./MediaGrid";
import MediaGridSkeleton from "./MediaGridSkeleton";
import GenreFilter from "./GenreFilter";
import { SeriesDetails, type Movie } from "@/types";

interface MediaTabsProps {
  movies: Movie[];
  series: SeriesDetails[];
  genres: { id: number; name: string }[];
  defaultTab?: "movies" | "series";
}

export default function MediaTabs({
  movies,
  series,
  genres,
  defaultTab = "movies",
}: MediaTabsProps) {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(false);

  const filterByGenres = (items: (Movie | SeriesDetails)[]) => {
    if (selectedGenres.length === 0) return items;
    return items.filter((item) =>
      item.genre_ids.some((genreId) => selectedGenres.includes(genreId))
    );
  };

  // When tab changes or genres change, briefly show loading state
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(timer);
  }, [activeTab, selectedGenres]);

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue={defaultTab}
        onValueChange={(value) => setActiveTab(value as "movies" | "series")}
      >
        <div className="flex items-center justify-between">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="movies">Movies</TabsTrigger>
            <TabsTrigger value="series">Series</TabsTrigger>
          </TabsList>

          <GenreFilter
            genres={genres}
            selectedGenres={selectedGenres}
            onGenreSelect={setSelectedGenres}
          />
        </div>

        <TabsContent value="movies">
          {isLoading ? (
            <MediaGridSkeleton count={10} title="Movies" />
          ) : (
            <MediaGrid
              items={filterByGenres(movies)}
              type="movie"
              title="Movies"
            />
          )}
        </TabsContent>

        <TabsContent value="series">
          {isLoading ? (
            <MediaGridSkeleton count={10} title="Series" />
          ) : (
            <MediaGrid
              items={filterByGenres(series)}
              type="series"
              title="Series"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
