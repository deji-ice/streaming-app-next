"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaGrid from "./MediaGrid";
import GenreFilter from "./GenreFilter";
import { type Movie, type Series } from "@/types";

interface MediaTabsProps {
  movies: Movie[];
  series: Series[];
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

  const filterByGenres = (items: (Movie | Series)[]) => {
    if (selectedGenres.length === 0) return items;
    return items.filter((item) =>
      item.genre_ids.some((genreId) => selectedGenres.includes(genreId))
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue={defaultTab}>
      <div className="flex items-center justify-between mb-6">
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
          <MediaGrid items={filterByGenres(movies)} type="movie" title="Movies" />
        </TabsContent>
        <TabsContent value="series">
          <MediaGrid items={filterByGenres(series)} type="series" title="Series" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
