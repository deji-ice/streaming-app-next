// components/media/MediaInfo.tsx
import Image from "next/image";
import { Star, Calendar, Clock, Globe, Users, Film } from "lucide-react";

interface MediaInfoProps {
  title: string;
  overview: string;
  releaseDate: string;
  rating: number;
  posterPath: string;
  genres: string[];
  duration: number; // in minutes
  cast: Array<{ id: number; name: string }>;
  country: string;
}

export default function MediaInfo({
  title,
  overview,
  releaseDate,
  rating,
  posterPath,
  genres,
  duration,
  cast,
  country,
}: MediaInfoProps) {
  const imageUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : "/placeholder-poster.jpg";

  return (
    <div className="relative flex flex-col md:flex-row gap-8 bg-black/5 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
      {/* Poster Section with Gradient Overlay */}
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="aspect-[2/3] relative rounded-xl overflow-hidden group">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 relative">
        {/* Title and Rating */}
        <div className="space-y-4">
          <h1
            className="text-4xl md:text-5xl font-montserrat font-bold 
                       bg-clip-text text-transparent bg-gradient-to-r 
                       from-primary to-primary/50"
          >
            {title}
          </h1>

          <div
            className="flex items-center gap-4 p-2 bg-black/10 dark:bg-white/5 
                         backdrop-blur rounded-lg w-fit"
          >
            <div className="flex items-center">
              <Star className="w-5 h-5 text-yellow-500 mr-1" />
              <span className="font-roboto text-lg">{rating.toFixed(1)}</span>
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Calendar className="w-5 h-5 text-primary" />
            <span className="font-roboto">
              {new Date(releaseDate).toLocaleDateString()}
            </span>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Film className="w-5 h-5 text-primary" />
            <span className="font-roboto truncate">{genres.join(", ")}</span>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Users className="w-5 h-5 text-primary" />
            <span className="font-roboto truncate">
              {cast
                .slice(0, 3)
                .map((c) => c.name)
                .join(", ")}
            </span>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-roboto">
              {Math.floor(duration / 60)}h {duration % 60}m
            </span>
          </div>

          <div
            className="flex items-center gap-3 p-3 rounded-lg 
                         bg-black/5 dark:bg-white/5 backdrop-blur-sm
                         transition-colors hover:bg-black/10 dark:hover:bg-white/10"
          >
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-roboto">{country}</span>
          </div>
        </div>

        {/* Overview with Gradient Border */}
        <div
          className="mt-8 p-4 rounded-lg bg-black/5 dark:bg-white/5 
                       backdrop-blur-sm border border-primary/20
                       relative before:absolute before:inset-0 
                       before:rounded-lg before:p-[1px]
                        before:-z-10"
        >
          <p className="text-lg font-roboto leading-relaxed">{overview}</p>
        </div>
      </div>
    </div>
  );
}
