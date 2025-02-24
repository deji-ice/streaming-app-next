"use client";

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Filter, X } from "lucide-react";

interface GenreFilterProps {
  genres: { id: number; name: string }[];
  selectedGenres: number[];
  onGenreSelect: (genres: number[]) => void;
}

export default function GenreFilter({
  genres,
  selectedGenres,
  onGenreSelect,
}: GenreFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filter
            {selectedGenres.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/20 px-2 py-0.5 text-xs">
                {selectedGenres.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Filter by Genre</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {genres.map((genre) => (
            <DropdownMenuCheckboxItem
              key={genre.id}
              checked={selectedGenres.includes(genre.id)}
              onCheckedChange={() => {
                const newSelected = selectedGenres.includes(genre.id)
                  ? selectedGenres.filter((id) => id !== genre.id)
                  : [...selectedGenres, genre.id];
                onGenreSelect(newSelected);
              }}
            >
              {genre.name}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedGenres.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onGenreSelect([])}
          className="gap-2 text-muted-foreground hover:text-primary"
        >
          <X className="w-4 h-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
