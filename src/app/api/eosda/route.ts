import { NextRequest, NextResponse } from "next/server";

function pointArea(latitude: number, longitude: number) {
  const delta = 0.02;
  return {
    type: "Polygon",
    coordinates: [[
      [longitude - delta, latitude - delta],
      [longitude + delta, latitude - delta],
      [longitude + delta, latitude + delta],
      [longitude - delta, latitude + delta],
      [longitude - delta, latitude - delta],
    ]],
  };
}

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("latitude"));
  const longitude = Number(request.nextUrl.searchParams.get("longitude"));
  const apiKey = process.env.EOSDA_API_KEY;

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return NextResponse.json({ error: "Valid latitude and longitude are required." }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ configured: false, error: "EOSDA_API_KEY is not configured." }, { status: 503 });
  }

  const endpoint = new URL("https://api-connect.eos.com/api/gdw/api");
  endpoint.searchParams.set("api_key", apiKey);
  const end = new Date();
  const start = new Date(end);
  start.setDate(end.getDate() - 30);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "mt_stats",
        params: {
          bm_type: ["NDVI"],
          date_start: start.toISOString().slice(0, 10),
          date_end: end.toISOString().slice(0, 10),
          geometry: pointArea(latitude, longitude),
        },
      }),
      cache: "no-store",
    });
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      return NextResponse.json({
        configured: true,
        error: "EOSDA rejected the crop-health request.",
        details: data,
      }, { status: response.status });
    }
    const taskId = data && typeof data === "object" && "task_id" in data && typeof data.task_id === "string" ? data.task_id : null;
    return NextResponse.json({ configured: true, source: "EOSDA API Connect", status: "submitted", taskId, task: data });
  } catch (error) {
    console.error("EOSDA request failed", error);
    return NextResponse.json({ configured: true, error: "EOSDA is temporarily unavailable." }, { status: 502 });
  }
}
