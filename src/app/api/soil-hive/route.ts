import { NextRequest, NextResponse } from "next/server";

type TokenResponse = { access_token?: string };

function pointWkt(latitude: number, longitude: number) {
  return `POINT(${longitude} ${latitude})`;
}

async function getToken() {
  const token = process.env.SOILHIVE_ACCESS_TOKEN;
  if (token) return token;
  const clientId = process.env.SOILHIVE_CLIENT_ID;
  const clientSecret = process.env.SOILHIVE_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch("https://auth.soilhive.ag/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
      audience: "https://api.soilhive.ag/",
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null) as TokenResponse | null;
  if (!response.ok || !data?.access_token) throw new Error("SoilHive authentication failed.");
  return data.access_token;
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }

  const datasetIds = (process.env.SOILHIVE_DATASET_IDS ?? "").split(",").map(Number).filter(Number.isInteger);
  const soilPropertyIds = (process.env.SOILHIVE_PROPERTY_IDS ?? "").split(",").map(Number).filter(Number.isInteger);
  if ((!process.env.SOILHIVE_ACCESS_TOKEN && (!process.env.SOILHIVE_CLIENT_ID || !process.env.SOILHIVE_CLIENT_SECRET)) || !datasetIds.length || !soilPropertyIds.length) {
    return NextResponse.json({ configured: false, error: "SoilHive credentials, dataset IDs, and property IDs are not configured." }, { status: 503 });
  }

  try {
    const token = await getToken();
    if (!token) return NextResponse.json({ configured: false, error: "SoilHive credentials are not configured." }, { status: 503 });
    const response = await fetch("https://api.soilhive.ag/v1/soil-data-by-geometry", {
      method: "POST",
      headers: {
        Accept: "application/ld+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        geometry: pointWkt(latitude, longitude),
        datasets: datasetIds,
        soilProperties: soilPropertyIds,
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) return NextResponse.json({ configured: true, error: "SoilHive rejected the soil request.", details: data }, { status: response.status });
    return NextResponse.json({ configured: true, source: "SoilHive API", data });
  } catch (error) {
    console.error("SoilHive request failed", error);
    return NextResponse.json({ configured: true, error: "SoilHive is temporarily unavailable." }, { status: 502 });
  }
}
