import { NextRequest, NextResponse } from "next/server";
import { countries } from "@/data/countries";

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export async function GET(request: NextRequest, context: RouteContext<"/api/country/[id]">) {
  const { id } = await context.params;
  const country = countries[id.toLowerCase().replace(/\s+/g, "_")];
  if (!country) return NextResponse.json({ success: false, error: "Country not found." }, { status: 404 });

  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setUTCDate(endDate.getUTCDate() - 7);
  const endpoint = new URL("https://power.larc.nasa.gov/api/temporal/daily/point");
  endpoint.searchParams.set("parameters", "T2M,PRECTOTCORR,ALLSKY_SFC_SW_DWN");
  endpoint.searchParams.set("community", "AG");
  endpoint.searchParams.set("longitude", String(country.lon));
  endpoint.searchParams.set("latitude", String(country.lat));
  endpoint.searchParams.set("start", formatDate(startDate));
  endpoint.searchParams.set("end", formatDate(endDate));
  endpoint.searchParams.set("format", "JSON");

  try {
    const response = await fetch(endpoint, { next: { revalidate: 900 } });
    if (!response.ok) throw new Error("NASA POWER request failed");
    const payload = await response.json();
    return NextResponse.json({
      success: true,
      country: country.name,
      code: country.code,
      region: country.region,
      coordinates: { latitude: country.lat, longitude: country.lon },
      mainCrops: country.mainCrops,
      nasaDataSource: "NASA POWER Project",
      timeWindow: { startDate: formatDate(startDate), endDate: formatDate(endDate) },
      weatherAndAgriculturalMetrics: payload.properties?.parameter ?? {},
    });
  } catch {
    return NextResponse.json({ success: false, error: "Could not fetch NASA telemetry.", staticCountryData: country }, { status: 502 });
  }
}
