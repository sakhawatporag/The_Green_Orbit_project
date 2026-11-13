"use client";

import { useState } from "react";

type ImageItem = { title: string; description: string; href: string; sourceUrl?: string };
const cropImageNames: Record<string, string> = {
  rice: "rice",
  wheat: "wheat",
  corn: "corn",
  maize: "corn",
  jute: "jute",
  tea: "tea",
  cotton: "cotton",
  sugarcane: "sugarcane",
  soybean: "soybean",
  coffee: "coffee",
  barley: "barley",
  sorghum: "sorghum",
  cassava: "cassava",
  cocoa: "cocoa",
  banana: "banana",
  grapes: "grapes",
  potato: "potato",
  olives: "olive",
  olive: "olive",
};

const regionalImages: Record<string, ImageItem> = {
  "United States": {
    title: "Prairie field view",
    description: "Representative field imagery for the agricultural landscape around the selected United States location.",
    href: "/agriculture/prairie.svg",
  },
  Senegal: {
    title: "Sahel dryland field",
    description: "Dryland agriculture imagery matched to the Sahel region and its seasonal growing conditions.",
    href: "/agriculture/sahel.svg",
  },
  Australia: {
    title: "Australian dryland field",
    description: "Dryland agriculture imagery matched to the selected Australian field region.",
    href: "/agriculture/dryland.svg",
  },
  India: {
    title: "Monsoon agriculture field",
    description: "Monsoon agriculture imagery matched to the selected Indian field region.",
    href: "/agriculture/monsoon.svg",
  },
};

const regionalCrops: Record<string, string[]> = {
  "United States": ["Corn", "Soybean", "Wheat", "Barley"],
  Senegal: ["Sorghum", "Rice", "Corn"],
  Australia: ["Wheat", "Barley", "Canola"],
  India: ["Rice", "Wheat", "Cotton"],
};

function fieldImages(country: string, crops: string[] = []) {
  const selectedCrops = crops.length ? crops : regionalCrops[country] ?? ["Wheat", "Corn", "Rice"];
  const cropImages = selectedCrops
    .map((crop) => ({ crop, file: cropImageNames[crop.toLowerCase()] }))
    .filter((item): item is { crop: string; file: string } => Boolean(item.file))
    .map(({ crop, file }) => ({
      title: `${crop} field view`,
      description: `Agriculture field imagery for ${crop} production in ${country}.`,
      href: `/crop-photos/${file}.jpg`,
    }));
  const regionalImage = regionalImages[country] ?? {
    title: `${country} agriculture landscape`,
    description: `Representative agriculture landscape imagery for ${country}.`,
    href: "/agriculture/tropical.svg",
  };
  return [...cropImages, regionalImage];
}

function ImageCard({ image, fallback }: { image: ImageItem; fallback: ImageItem }) {
  const [imageSource, setImageSource] = useState(image.href);
  const [failed, setFailed] = useState(false);
  return <a key={`${image.href}-${image.title}`} href={image.sourceUrl ?? image.href} target="_blank" rel="noreferrer" className={`group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-[#c6ff7b]/50 ${failed ? "hidden" : ""}`}>
    <img src={imageSource} alt={image.title} loading="lazy" onError={() => { if (imageSource !== fallback.href) setImageSource(fallback.href); else setFailed(true); }} className="h-44 w-full object-cover transition duration-500 group-hover:scale-105" />
    <div className="p-4"><h3 className="line-clamp-2 text-sm font-semibold">{image.title}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-[#8fa49a]">{image.description}</p></div>
  </a>;
}

export function NasaGallery({ country, crops }: { country: string; crops?: string[] }) {
  const images = fieldImages(country, crops);
  const fallback = images[images.length - 1];

  return <section className="mt-8"><div className="mb-5 flex items-end justify-between"><div><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Satellite view · {country}</p><h2 className="mt-2 text-3xl font-semibold">Field and agriculture imagery</h2></div><span className="text-sm text-[#c6ff7b]">Curated field set</span></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{images.map((image) => <ImageCard key={`${image.href}-${image.title}`} image={image} fallback={fallback} />)}</div><p className="mt-4 text-xs text-[#70887a]">Images are selected from the region’s crop profile and agriculture landscape set, so this view does not show unrelated random results.</p></section>;
}
