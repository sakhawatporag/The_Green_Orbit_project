"use client";

import { useEffect, useState } from "react";

type ImageItem = { title: string; description: string; href: string; sourceUrl?: string };

export function NasaGallery({ query }: { query: string }) {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const nasa = fetch(`/api/nasa-images?q=${encodeURIComponent(query)}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("NASA imagery unavailable");
      return response.json() as Promise<{ images?: ImageItem[] }>;
    });
    const commons = fetch(`/api/wikimedia-images?q=${encodeURIComponent(`${query.split(" satellite")[0]} crop field`)}`, { signal: controller.signal }).then(async (response) => {
      if (!response.ok) throw new Error("Wikimedia imagery unavailable");
      return response.json() as Promise<{ images?: ImageItem[] }>;
    });
    Promise.allSettled([nasa, commons])
      .then(([nasaResult, commonsResult]) => {
        const nasaImages = nasaResult.status === "fulfilled" ? nasaResult.value.images ?? [] : [];
        const commonsImages = commonsResult.status === "fulfilled" ? commonsResult.value.images ?? [] : [];
        setImages([...nasaImages, ...commonsImages]);
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setImages([]);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [query]);

  return <section className="mt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Live Earth imagery · {query.split(" satellite")[0]}</p><h2 className="mt-2 text-3xl font-semibold">Satellite and field views</h2></div><div className="flex gap-4 text-sm text-[#c6ff7b]"><a href="https://images.nasa.gov/" target="_blank" rel="noreferrer" className="hover:underline">NASA ↗</a><a href="https://commons.wikimedia.org/" target="_blank" rel="noreferrer" className="hover:underline">Wikimedia ↗</a></div></div>{loading && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[1, 2, 3, 4, 5, 6, 7, 8].map((item) => <div key={item} className="h-56 animate-pulse rounded-2xl border border-white/10 bg-white/[0.04]" />)}</div>}{!loading && images.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{images.slice(0, 8).map((image) => <a key={`${image.href}-${image.title}`} href={image.sourceUrl ?? "https://images.nasa.gov/"} target="_blank" rel="noreferrer" className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-[#c6ff7b]/50"><img src={image.href} alt={image.title} loading="lazy" className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" /><div className="p-4"><h3 className="line-clamp-2 text-sm font-semibold">{image.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8fa49a]">{image.description}</p></div></a>)}</div>}{!loading && images.length === 0 && <p className="rounded-2xl border border-white/10 p-5 text-sm text-[#8fa49a]">Live imagery is temporarily unavailable.</p>}<p className="mt-4 text-xs text-[#70887a]">Sources: NASA Image and Video Library plus Wikimedia Commons. Results refresh when the selected country changes.</p></section>;
}
