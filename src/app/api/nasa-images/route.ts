import { NextRequest, NextResponse } from "next/server";

type NasaAsset = {
  href?: string;
  data?: Array<{ title?: string; description?: string; location?: string }>;
  links?: Array<{ href?: string; render?: string; rel?: string }>;
};

function imageUrl(item: NasaAsset) {
  return item.links?.find((link) => link.render === "image" && /\.(jpe?g|png)(\?.*)?$/i.test(link.href ?? ""))?.href ?? null;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "agriculture Earth observation";
  try {
    const response = await fetch(`https://images-api.nasa.gov/search?q=${encodeURIComponent(query)}&media_type=image&page_size=12`, {
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ error: "NASA imagery is temporarily unavailable." }, { status: 502 });
    const payload = await response.json();
    const items = (payload.collection?.items ?? []) as NasaAsset[];
    const images = (await Promise.all(items
      .filter((item) => item.href && item.data?.[0]?.title)
      .slice(0, 12)
      .map(async (item) => ({
        title: item.data?.[0]?.title ?? "NASA Earth observation",
        description: item.data?.[0]?.description ?? "NASA Earth observation imagery.",
        href: imageUrl(item),
      })))).filter((image): image is { title: string; description: string; href: string } => Boolean(image.href));
    return NextResponse.json({ source: "NASA Image and Video Library", images });
  } catch {
    return NextResponse.json({ error: "Unable to load NASA imagery right now." }, { status: 502 });
  }
}
