import type { Metadata } from "next";

import { ListingPage, listingMetadata } from "@/components/catalog/listing-page";
import type { RawSearchParams } from "@/components/catalog/params";

interface SeriesPageProps {
  searchParams: Promise<RawSearchParams>;
}

export async function generateMetadata({ searchParams }: SeriesPageProps): Promise<Metadata> {
  return listingMetadata("tv", await searchParams);
}

export default async function SeriesPage({ searchParams }: SeriesPageProps) {
  return <ListingPage type="tv" params={await searchParams} />;
}
