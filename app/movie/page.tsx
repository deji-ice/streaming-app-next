import type { Metadata } from "next";

import { ListingPage, listingMetadata } from "@/components/catalog/listing-page";
import type { RawSearchParams } from "@/components/catalog/params";

interface MoviesPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: MoviesPageProps): Promise<Metadata> {
  return listingMetadata("movie", await searchParams);
}

export default async function MoviesPage({ searchParams }: MoviesPageProps) {
  return <ListingPage type="movie" params={await searchParams} />;
}
