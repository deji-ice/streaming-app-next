"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SeasonSelectorProps {
  seasons: Array<{
    id: number;
    name: string;
    season_number: number;
    episode_count: number;
  }>;
  currentSeason: number;
}

export default function SeasonSelector({
  seasons,
  currentSeason,
}: SeasonSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSeasonChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set("season", value);
    // Use replace to avoid adding to history stack
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <Select value={currentSeason.toString()} onValueChange={handleSeasonChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.season_number.toString()}>
            {season.name} ({season.episode_count} episodes)
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
