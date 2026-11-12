import { countries } from "@/data/countries";

type Props = { country: string; locationName: string };

const profiles = [
  {
    match: "United States",
    region: "Prairie farming",
    image: "/agriculture/prairie.svg",
    facts: ["Corn and soybean systems", "Winter cover crops", "Strong local grain markets"],
    caption: "Satellite observations help track crop stress across large field networks.",
  },
  {
    match: "India",
    region: "Monsoon agriculture",
    image: "/agriculture/monsoon.svg",
    facts: ["Rice, wheat, pulses", "Monsoon timing matters", "Water-efficient crops are valuable"],
    caption: "Seasonal rainfall and heat signals can guide crop-window decisions.",
  },
  {
    match: "Australia",
    region: "Dryland agriculture",
    image: "/agriculture/dryland.svg",
    facts: ["Sorghum and pulses", "Heat and drought risk", "Deep roots support resilience"],
    caption: "Heat stress and rainfall variability make rotation diversity important.",
  },
  {
    match: "Senegal",
    region: "Sahel food systems",
    image: "/agriculture/sahel.svg",
    facts: ["Millet and cowpea", "Rain-fed growing windows", "Residue protects soil"],
    caption: "Rainfall reliability and soil moisture are central to food security.",
  },
];

export function CountryShowcase({ country, locationName }: Props) {
  const authoredProfile = profiles.find((item) => country.includes(item.match));
  const catalog = Object.values(countries).find((item) => item.name.toLowerCase() === country.toLowerCase());
  const fallbackImages = [
    "/agriculture/prairie.svg",
    "/agriculture/monsoon.svg",
    "/agriculture/sahel.svg",
    "/agriculture/dryland.svg",
    "/agriculture/tropical.svg",
    "/agriculture/orchard.svg",
    "/agriculture/vineyard.svg",
  ];
  let hash = 0;
  for (const character of country) hash = (hash * 31 + character.charCodeAt(0)) >>> 0;
  const catalogImage = catalog?.mainCrops.some((crop) => /coffee|tea|cocoa|banana|palm|rubber/i.test(crop))
    ? "/agriculture/tropical.svg"
    : catalog?.mainCrops.some((crop) => /grape|fruit|apple|olive|citrus/i.test(crop))
      ? "/agriculture/orchard.svg"
      : catalog?.mainCrops.some((crop) => /wheat|barley|rye|oat|canola|rapeseed/i.test(crop))
        ? "/agriculture/prairie.svg"
        : fallbackImages[hash % fallbackImages.length];
  const profile = authoredProfile ?? {
    region: catalog?.region ?? "Local agriculture",
    image: catalogImage,
    facts: catalog?.mainCrops.slice(0, 3) ?? ["Adapted local crops", "Seasonal climate patterns", "Farmer-led decisions"],
    caption: `The ${country} profile prioritizes ${catalog?.mainCrops.slice(0, 2).join(" and ") ?? "locally adapted crops"} alongside local knowledge and NASA observations.`,
  };

  return (
    <section className="mt-8 grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#0c241b]/80 lg:grid-cols-[0.85fr_1.15fr]">
      <div key={`${country}-${profile.image}`} className="min-h-[280px] bg-cover bg-center" style={{ backgroundImage: `linear-gradient(90deg, rgba(7,23,19,.05), rgba(7,23,19,.35)), url("${profile.image}")` }} role="img" aria-label={`${profile.region} landscape near ${locationName}`} />
      <div className="p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Place profile · {profile.region}</p>
        <h2 className="mt-3 text-3xl font-semibold">{locationName}</h2>
        <p className="mt-4 leading-7 text-[#b8c5bb]">{profile.caption}</p>
        <div className="mt-6 grid gap-2 sm:grid-cols-3">
          {profile.facts.map((fact) => <div key={fact} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-sm text-[#d3e2d3]">{fact}</div>)}
        </div>
        <p className="mt-5 text-xs text-[#70887a]">Illustrative regional field view. Climate evidence: NASA POWER, SMAP, ECOSTRESS, and GPM.</p>
      </div>
    </section>
  );
}
