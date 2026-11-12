import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const latitude = Number(searchParams.get("latitude"));
  const longitude = Number(searchParams.get("longitude"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }

  const endpoint = new URL("https://power.larc.nasa.gov/api/temporal/climatology/point");
  endpoint.searchParams.set("parameters", "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN");
  endpoint.searchParams.set("community", "AG");
  endpoint.searchParams.set("longitude", String(longitude));
  endpoint.searchParams.set("latitude", String(latitude));
  endpoint.searchParams.set("format", "JSON");

  try {
    const response = await fetch(endpoint, { next: { revalidate: 86400 } });
    if (!response.ok) {
      return NextResponse.json({ error: "NASA POWER could not return data for this location." }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json({
      source: "NASA POWER climatology API",
      location: data.geometry,
      parameters: data.properties?.parameter ?? {},
    });
  } catch {
    return NextResponse.json({ error: "NASA POWER is temporarily unavailable." }, { status: 502 });
  }
}
