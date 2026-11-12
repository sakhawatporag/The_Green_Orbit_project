import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim();
  if (!query) return NextResponse.json({ error: "A search query is required." }, { status: 400 });

  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=5&q=${encodeURIComponent(query)}`, {
      headers: { "User-Agent": "AgroSpaceInsights/1.0 (NASA Space Apps project)" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ error: "Geocoding service unavailable." }, { status: 502 });
    const results = await response.json();
    return NextResponse.json(results.map((item: { display_name: string; lat: string; lon: string; address?: { country?: string } }) => ({
      name: item.display_name,
      country: item.address?.country ?? "Selected region",
      latitude: Number(item.lat),
      longitude: Number(item.lon),
    })));
  } catch {
    return NextResponse.json({ error: "Unable to search this location right now." }, { status: 502 });
  }
}
