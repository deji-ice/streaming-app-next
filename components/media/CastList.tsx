import Image from "next/image";
import type { Cast } from "@/types";

interface CastListProps {
  cast: Cast[];
}

export default function CastList({ cast }: CastListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {cast.slice(0, 12).map((person) => (
        <div key={person.id} className="text-center">
          <div className="aspect-[2/3] relative rounded-lg overflow-hidden mb-2">
            <Image
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w300${person.profile_path}`
                  : "/placeholder-cast.jpg"
              }
              alt={person.name}
              fill
              className="object-cover"
            />
          </div>
          <h3 className="font-montserrat font-bold text-sm truncate">
            {person.name}
          </h3>
          <p className="text-sm text-muted-foreground font-roboto truncate">
            {person.character}
          </p>
        </div>
      ))}
    </div>
  );
}