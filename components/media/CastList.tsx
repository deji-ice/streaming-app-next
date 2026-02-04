import Image from "next/image";
import type { Cast } from "@/types";

interface CastListProps {
  cast: Cast[];
}

export default function CastList({ cast }: CastListProps) {
  if (!cast || cast.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
      {cast.slice(0, 12).map((person) => (
        <div key={person.id} className="group relative">
          <div className="aspect-[2/3] relative overflow-hidden rounded-xl bg-muted/30">
            <Image
              src={
                person.profile_path
                  ? `https://image.tmdb.org/t/p/w500${person.profile_path}`
                  : "/placeholder-cast.jpg"
              }
              alt={person.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
            />

            {/* Elegant gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Character name shown on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <p className="text-xs text-white font-medium truncate">
                {person.character || "Unknown Role"}
              </p>
            </div>
          </div>

          {/* Name below image */}
          <div className="mt-2 text-center px-1">
            <h3 className="font-montserrat font-medium text-sm truncate">
              {person.name}
            </h3>
            {/* <p className="text-xs text-muted-foreground font-montserrat md:hidden truncate">
              {person.character || "Unknown Role"}
            </p> */}
          </div>
        </div>
      ))}
    </div>
  );
}
