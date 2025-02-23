import { type Movie, type Series } from "@/types";
import MediaCard from "./MediaCard";


interface MediaGridProps {
  items: (Movie | Series)[];
  type: "movie" | "series";
  title: string;
}

export default function MediaGrid({ items, type, title }: MediaGridProps) {
  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-montserrat font-bold mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {items.map((item) => (
            <MediaCard  key={item.id} item={item} type={type} />
          ))}
        </div>
      </div>
    </section>
  );
}