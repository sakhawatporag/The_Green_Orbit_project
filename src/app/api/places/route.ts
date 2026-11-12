import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));
  const radius = Math.min(Math.max(Number(request.nextUrl.searchParams.get("radius") ?? 25000), 1000), 50000);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }

  const query = `[out:json][timeout:20];(nwr(around:${radius},${latitude},${longitude})["shop"~"farm|organic|marketplace"];nwr(around:${radius},${latitude},${longitude})["amenity"~"marketplace|farmers_market|composting"];nwr(around:${radius},${latitude},${longitude})["man_made"~"biogas|wastewater_plant"];nwr(around:${radius},${latitude},${longitude})["power"="plant"]["plant:source"~"biogas|biomass"];);out center tags;`;

  try {
    const response = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "AgroSpaceInsights/1.0" },
      body: `data=${encodeURIComponent(query)}`,
      next: { revalidate: 900 },
    });
    if (!response.ok) return NextResponse.json({ error: "OpenStreetMap places are temporarily unavailable." }, { status: 502 });
    const data = await response.json();
    const places = (data.elements ?? []).map((item: { id: number; lat?: number; lon?: number; center?: { lat: number; lon: number }; tags?: Record<string, string> }) => {
      const tags = item.tags ?? {};
      const kind = tags["plant:source"] === "biogas" || tags["plant:source"] === "biomass" || tags.man_made === "biogas" ? "Biogas / biomass" : tags.shop === "farm" || tags.amenity === "farmers_market" ? "Farm / food source" : "Market / compost";
      return { id: item.id, name: tags.name ?? "Unnamed local facility", kind, latitude: item.lat ?? item.center?.lat, longitude: item.lon ?? item.center?.lon };
    }).filter((place: { latitude?: number; longitude?: number }) => place.latitude !== undefined && place.longitude !== undefined);
    return NextResponse.json({ source: "OpenStreetMap Overpass", places });
  } catch {
    return NextResponse.json({ error: "Unable to load nearby places right now." }, { status: 502 });
  }
}
