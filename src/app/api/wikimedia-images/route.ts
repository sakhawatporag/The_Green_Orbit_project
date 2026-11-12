import { NextRequest, NextResponse } from "next/server";

type WikimediaPage = {
  title?: string;
  imageinfo?: Array<{
    thumburl?: string;
    descriptionurl?: string;
    extmetadata?: { ImageDescription?: { value?: string } };
  }>;
};

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q")?.trim() || "agriculture field";
  const endpoint = new URL("https://commons.wikimedia.org/w/api.php");
  endpoint.searchParams.set("action", "query");
  endpoint.searchParams.set("generator", "search");
  endpoint.searchParams.set("gsrsearch", `${query} filetype:bitmap`);
  endpoint.searchParams.set("gsrnamespace", "6");
  endpoint.searchParams.set("gsrlimit", "8");
  endpoint.searchParams.set("prop", "imageinfo");
  endpoint.searchParams.set("iiprop", "url|extmetadata");
  endpoint.searchParams.set("iiurlwidth", "900");
  endpoint.searchParams.set("format", "json");
  endpoint.searchParams.set("origin", "*");

  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json", "User-Agent": "AgroSpace-Insights/1.0" },
      next: { revalidate: 3600 },
    });
    if (!response.ok) return NextResponse.json({ error: "Wikimedia imagery is temporarily unavailable." }, { status: 502 });
    const payload = await response.json();
    const pages = Object.values((payload.query?.pages ?? {}) as Record<string, WikimediaPage>);
    const images = pages
      .map((page) => {
        const info = page.imageinfo?.[0];
        return info?.thumburl ? {
          title: (page.title ?? "Agriculture field").replace(/^File:/, ""),
          description: info.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, "").slice(0, 240) || "Open agriculture photograph from Wikimedia Commons.",
          href: info.thumburl,
          sourceUrl: info.descriptionurl ?? "https://commons.wikimedia.org/",
        } : null;
      })
      .filter((image): image is { title: string; description: string; href: string; sourceUrl: string } => Boolean(image));
    return NextResponse.json({ source: "Wikimedia Commons", images });
  } catch (error) {
    console.error("Wikimedia imagery request failed", error);
    return NextResponse.json({ error: "Unable to load Wikimedia imagery right now." }, { status: 502 });
  }
}
