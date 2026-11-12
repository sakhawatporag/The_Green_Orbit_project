import { NextRequest, NextResponse } from "next/server";

type Geometry = {
  type: "Point" | "Polygon" | "MultiPolygon";
  coordinates: unknown;
};

function isGeometry(value: unknown): value is Geometry {
  if (!value || typeof value !== "object" || !("type" in value) || !("coordinates" in value)) return false;
  const type = value.type;
  return (type === "Point" || type === "Polygon" || type === "MultiPolygon") && Array.isArray(value.coordinates);
}

async function getAccessToken() {
  const staticToken = process.env.VARDA_ACCESS_TOKEN;
  if (staticToken) return staticToken;

  const clientId = process.env.VARDA_CLIENT_ID;
  const clientSecret = process.env.VARDA_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const response = await fetch("https://auth.varda.ag/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      audience: "https://api.varda.ag/fid/",
      grant_type: "client_credentials",
    }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok || !data || typeof data !== "object" || !("access_token" in data) || typeof data.access_token !== "string") {
    throw new Error("Varda authentication failed.");
  }
  return data.access_token;
}

async function searchField(geometry: Geometry, token: string) {
  return fetch("https://api.varda.ag/fid/v1/field-searches", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(geometry),
    cache: "no-store",
  });
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }
  return lookup({ type: "Point", coordinates: [longitude, latitude] });
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json().catch(() => null);
  const geometry = body && typeof body === "object" && "geometry" in body ? body.geometry : body;
  if (!isGeometry(geometry)) return NextResponse.json({ error: "A GeoJSON Point, Polygon, or MultiPolygon is required." }, { status: 400 });
  return lookup(geometry);
}

async function lookup(geometry: Geometry) {
  try {
    const token = await getAccessToken();
    if (!token) return NextResponse.json({ configured: false, error: "VARDA_ACCESS_TOKEN or Varda OAuth credentials are not configured." }, { status: 503 });

    const response = await searchField(geometry, token);
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({ configured: true, error: "Varda rejected the field lookup.", details: data }, { status: response.status });
    }
    return NextResponse.json({ configured: true, source: "Varda Global FieldID", ...data });
  } catch (error) {
    console.error("Varda field lookup failed", error);
    return NextResponse.json({ configured: true, error: "Varda is temporarily unavailable." }, { status: 502 });
  }
}
