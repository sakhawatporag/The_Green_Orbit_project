import { NextResponse } from "next/server";
import { countries } from "@/data/countries";

export function GET() {
  const data = Object.entries(countries).map(([id, country]) => ({ id, ...country }));
  return NextResponse.json({ success: true, total: data.length, data });
}
