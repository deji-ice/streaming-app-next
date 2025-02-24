// app/api/stream/route.ts
import { NextResponse } from "next/server";

const VIDSRC_BASE = process.env.NEXT_STREAM_BASE_URL; // Add to .env.local

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const tmdbId = searchParams.get("id");
  const season = searchParams.get("season");
  const episode = searchParams.get("episode");

  if (!type || !tmdbId) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const streamUrl = type === "movie" 
    ? `${VIDSRC_BASE}/embed/movie/${tmdbId}`
    : `${VIDSRC_BASE}/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`;

  return NextResponse.json({ url: streamUrl });
}