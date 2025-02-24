
"use client";

import { type Movie, type Series } from "@/types";
import MediaCard from "./MediaCard";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface RecommendedMediaProps {
  items: (Movie | Series)[];
  type: "movie" | "series";
  title?: string;
}

export default function RecommendedMedia({ 
  items, 
  type,
  title = "You May Also Like" 
}: RecommendedMediaProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-montserrat font-bold">{title}</h2>
      
      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex w-full gap-4 pb-4">
          {items.map((item) => (
            <div key={item.id} className="w-[250px] flex-shrink-0">
              <MediaCard item={item} type={type} />
            </div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}