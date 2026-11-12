"use client";

import { useEffect, useMemo, useState } from "react";
import { countries } from "@/data/countries";

type Props = { country: string; locationName: string; latitude: number; longitude: number };
type Crop = { name: string; reason: string; caution: string; tone: string; image: string };
type NasaSignals = { temperature: number; rainfall: number; solar: number };
type EosdaState = "loading" | "ready" | "unconfigured" | "unavailable";
type VardaState = { status: "loading" | "ready" | "unconfigured" | "unavailable"; fieldId?: string };

const cropImages: Record<string, string> = {
  rice: "/crop-photos/rice.jpg", wheat: "/crop-photos/wheat-specific.jpg", barley: "/crop-photos/barley.jpg",
  corn: "/crop-photos/corn.jpg", maize: "/crop-photos/corn.jpg", coffee: "/crop-photos/coffee.jpg",
  tea: "/crop-photos/tea.jpg", grapes: "/crop-photos/grapes.jpg", grape: "/crop-photos/grapes.jpg",
  potato: "/crop-photos/potato.jpg", potatoes: "/crop-photos/potato.jpg",
  cassava: "/crop-photos/cassava.jpg", sugarcane: "/crop-photos/sugarcane.jpg",
  soybean: "/crop-photos/soybean.jpg", soybeans: "/crop-photos/soybean.jpg",
  cotton: "/crop-photos/cotton.jpg",
  sorghum: "/crop-photos/sorghum.jpg", jute: "/crop-photos/jute.jpg",
  tobacco: "/crop-photos/tobacco.jpg", sunflower: "/crop-photos/sunflower.jpg",
  canola: "/crop-photos/canola.jpg", rapeseed: "/crop-photos/canola.jpg",
  banana: "/crop-photos/banana.jpg", cocoa: "/crop-photos/cocoa.jpg",
  apple: "/crop-photos/apple.jpg", olive: "/crop-photos/olive.jpg",
};

const fallbackCropImages = ["/crop-photos/wheat.jpg", "/crop-photos/legume.jpg", "/crop-photos/root.jpg", "/crop-photos/tropical.jpg", "/crop-photos/vine.jpg"];

function cropImageFor(name: string, usedImages = new Set<string>()) {
  const key = name.toLowerCase().replace(/\s*\(.*\)$/, "").replace(/^(high-water|thirsty|continuous|common|pearl)\s+/, "").replace(/s$/, "");
  const preferred = cropImages[key]
    ?? (/bean|lentil|pea|chickpea|soy|lupin|legume/.test(key) ? "/crop-photos/legume.jpg" : undefined)
    ?? (/fruit|apple|citrus|olive|grape|avocado/.test(key) ? "/crop-photos/vine.jpg" : undefined)
    ?? (/coffee|tea|cocoa|banana|palm|rubber|pepper/.test(key) ? "/crop-photos/tropical.jpg" : undefined)
    ?? (/potato|cassava|yam|beet|turnip|carrot|quinoa/.test(key) ? "/crop-photos/root.jpg" : undefined)
    ?? (/rice|jute/.test(key) ? "/crop-photos/rice.jpg" : undefined)
    ?? (/corn|maize|millet|sorghum|sunflower|canola|rapeseed/.test(key) ? "/crop-photos/corn.jpg" : undefined)
    ?? "/crop-photos/wheat.jpg";
  if (!usedImages.has(preferred)) return preferred;
  return fallbackCropImages.find((image) => !usedImages.has(image)) ?? preferred;
}

const detailVariants = [
  {
    reason: (crop: string, country: string, region: string) => `${crop} is a strong ${region.toLowerCase()} option for ${country}, with a useful fit for local food systems and farm markets.`,
    caution: (crop: string) => `Match ${crop} to the local planting window and confirm soil fertility before expanding it.`,
  },
  {
    reason: (crop: string, country: string, region: string) => `${crop} can diversify ${country}'s ${region.toLowerCase()} production when varieties are selected for the local climate.`,
    caution: (crop: string) => `Scout ${crop} early for pests and heat or moisture stress, then adjust irrigation to field conditions.`,
  },
  {
    reason: (crop: string, country: string, region: string) => `${crop} gives growers in ${country} another practical option for a ${region.toLowerCase()} rotation.`,
    caution: (crop: string) => `Check seed access, market demand, and the water requirement of ${crop} before planting at scale.`,
  },
];

function countryHash(value: string) {
  return [...value].reduce((hash, character) => (hash * 31 + character.charCodeAt(0)) >>> 0, 7);
}

function catalogProfile(country: string): Crop[] | null {
  const record = Object.values(countries).find((item) => item.name.toLowerCase() === country.trim().toLowerCase());
  if (!record) return null;
  const variant = detailVariants[countryHash(record.name) % detailVariants.length];
  const usedImages = new Set<string>();
  return record.mainCrops.slice(0, 3).map((name, index) => {
    const image = cropImageFor(name, usedImages);
    usedImages.add(image);
    return {
      name,
      reason: variant.reason(name, record.name, record.region),
      caution: index === 2 ? `Confirm water, soil, market, and seasonal conditions before expanding ${name} in ${record.name}.` : variant.caution(name),
      tone: index === 0 ? "cyan" : index === 1 ? "purple" : "amber",
      image,
    };
  });
}

const cropProfiles: Record<string, Crop[]> = {
  India: [
    { name: "Chickpea", reason: "A pulse crop that can fit a cooler, drier window and contribute nitrogen to the rotation.", caution: "Avoid where late-season moisture is already unreliable without an irrigation plan.", tone: "purple", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80" },
    { name: "Millet", reason: "Lower water demand and tolerance for heat make it a useful cereal alternative.", caution: "Confirm local market access and varieties with an agronomist.", tone: "cyan", image: "https://images.unsplash.com/photo-1536633051180-9c7c5e1e9c5e?auto=format&fit=crop&w=800&q=80" },
    { name: "Rice", reason: "Can fit warm, irrigated lowlands with reliable seasonal water.", caution: "Not recommended for water-limited fields because flooded production has high water demand.", tone: "amber", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80" },
  ],
  Australia: [
    { name: "Sorghum", reason: "A heat-tolerant cereal that can reduce exposure when temperatures rise.", caution: "Yield depends on rainfall arriving during the growing window.", tone: "cyan", image: "https://images.unsplash.com/photo-1598797265038-7f6a0d4c7d96?auto=format&fit=crop&w=800&q=80" },
    { name: "Cowpea", reason: "A warm-season legume that can add rotation diversity and soil nitrogen.", caution: "Check disease pressure and local seed availability.", tone: "purple", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80" },
    { name: "High-water rice", reason: "Only suitable where water supply and drainage are dependable.", caution: "Avoid in drought-prone fields to protect water reserves.", tone: "amber", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80" },
  ],
  Senegal: [
    { name: "Pearl millet", reason: "Well suited to heat and variable rainfall, supporting food security in dry conditions.", caution: "Use locally adapted varieties and monitor soil fertility.", tone: "cyan", image: "https://images.unsplash.com/photo-1601593768798-4c8f3f06c7a6?auto=format&fit=crop&w=800&q=80" },
    { name: "Cowpea", reason: "A drought-tolerant legume that adds protein and can improve rotation diversity.", caution: "Protect young plants from early-season dry spells.", tone: "purple", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80" },
    { name: "Thirsty maize", reason: "Can be productive in a strong rainy season with good soils.", caution: "Avoid as the only crop when rainfall onset and duration are uncertain.", tone: "amber", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80" },
  ],
  "United States": [
    { name: "Cover crop", reason: "Keeps soil covered between cash crops, helping infiltration and erosion control.", caution: "Choose a termination date that protects spring water availability.", tone: "emerald", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=800&q=80" },
    { name: "Soybean", reason: "Adds a legume phase and can diversify a corn-heavy rotation.", caution: "Scout for disease and avoid repeating the same host too frequently.", tone: "purple", image: "https://images.unsplash.com/photo-1530848469053-3c7b1b8c1f3a?auto=format&fit=crop&w=800&q=80" },
    { name: "Continuous corn", reason: "Familiar equipment and markets can simplify planning.", caution: "Repeated corn can increase nutrient demand, pest pressure, and bare-soil risk.", tone: "amber", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80" },
  ],
  Brazil: [
    { name: "Soybean", reason: "A major warm-season crop that can fit tropical and subtropical production zones.", caution: "Protect soil between seasons and monitor disease pressure.", tone: "purple", image: "https://images.unsplash.com/photo-1530848469053-3c7b1b8c1f3a?auto=format&fit=crop&w=800&q=80" },
    { name: "Cassava", reason: "A relatively drought-tolerant staple that can provide food security in variable rainfall.", caution: "Use healthy planting material and avoid repeated cultivation without soil restoration.", tone: "cyan", image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=800&q=80" },
    { name: "Sugarcane", reason: "Can be productive where rainfall, soil, and processing access are reliable.", caution: "Long rotations can increase water demand and reduce crop diversity.", tone: "amber", image: "https://images.unsplash.com/photo-1499529112087-3cb3b73cec95?auto=format&fit=crop&w=800&q=80" },
  ],
  Bangladesh: [
    { name: "Rice", reason: "Fits warm, monsoon-influenced lowlands and remains central to local food systems.", caution: "Use water-saving irrigation where dry-season water is limited.", tone: "cyan", image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=800&q=80" },
    { name: "Lentil", reason: "A short-duration pulse that can diversify rice-based systems and add nitrogen.", caution: "Plant only when drainage and the post-monsoon window are dependable.", tone: "purple", image: "https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80" },
    { name: "Jute", reason: "A locally important fiber crop that fits warm, humid growing conditions.", caution: "Avoid where standing water or market access creates harvest risk.", tone: "amber", image: "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=800&q=80" },
  ],
  Kenya: [
    { name: "Sorghum", reason: "Handles heat and variable rainfall better than many high-water cereals.", caution: "Select a locally adapted variety and protect seedlings from dry spells.", tone: "cyan", image: "https://images.unsplash.com/photo-1598797265038-7f6a0d4c7d96?auto=format&fit=crop&w=800&q=80" },
    { name: "Common bean", reason: "Provides food and a legume phase that can improve rotation diversity.", caution: "Monitor disease and do not plant into severely depleted soil.", tone: "purple", image: "https://images.unsplash.com/photo-1589927986089-35812388d1f4?auto=format&fit=crop&w=800&q=80" },
    { name: "Tea", reason: "Can suit cool, high-rainfall zones with established processing infrastructure.", caution: "Not suitable for dry lowlands or fields without long-term market access.", tone: "amber", image: "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80" },
  ],
  Mexico: [
    { name: "Maize", reason: "A locally important staple that can fit seasonal rainfall when planting windows are reliable.", caution: "Use drought-tolerant varieties where rainfall is becoming less predictable.", tone: "cyan", image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80" },
    { name: "Agave", reason: "Perennial agave can tolerate dry conditions and reduce seasonal water demand.", caution: "Long establishment periods require careful land and market planning.", tone: "emerald", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80" },
    { name: "Avocado", reason: "Can be valuable in suitable highland climates with market access.", caution: "High water demand makes it risky in water-stressed basins.", tone: "amber", image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=800&q=80" },
  ],
};

function profileFor(country: string) {
  const normalizedCountry = country.toLowerCase();
  const match = Object.entries(cropProfiles).find(([key]) => normalizedCountry.includes(key.toLowerCase()));
  if (match) {
    return match[1].map((crop) => ({ ...crop, image: cropImageFor(crop.name) }));
  }
  return null;
}

function average(values: Record<string, number> | undefined) {
  const numbers = Object.values(values ?? {}).filter(Number.isFinite);
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : null;
}

function scoreCrop(crop: Crop, signals: NasaSignals) {
  const text = crop.name.toLowerCase();
  let score = 62;
  if (signals.rainfall < 2 && /(millet|cowpea|sorghum|chickpea|cover|cassava)/.test(text)) score += 18;
  if (signals.rainfall > 3 && /(rice|jute|sugarcane|maize|corn)/.test(text)) score += 15;
  if (signals.temperature > 24 && /(rice|millet|sorghum|cowpea|cassava|sugarcane)/.test(text)) score += 12;
  if (signals.temperature < 15 && /(wheat|barley|chickpea|potato|oat)/.test(text)) score += 12;
  if (signals.solar > 5 && /(corn|maize|soybean|sugarcane|sorghum)/.test(text)) score += 8;
  return Math.min(98, score);
}

export function CropAdvisor({ country, locationName, latitude, longitude }: Props) {
  const crops = useMemo(() => profileFor(country) ?? catalogProfile(country) ?? [], [country]);
  const [signals, setSignals] = useState<NasaSignals | null>(null);
  const [loading, setLoading] = useState(true);
  const [eosdaState, setEosdaState] = useState<EosdaState>("loading");
  const [varda, setVarda] = useState<VardaState>({ status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/nasa-power?latitude=${latitude}&longitude=${longitude}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("NASA POWER unavailable");
        const data = await response.json();
        const parameters = data.parameters ?? {};
        const temperature = average(parameters.T2M);
        const rainfall = average(parameters.PRECTOTCORR);
        const solar = average(parameters.ALLSKY_SFC_SW_DWN);
        if (temperature === null || rainfall === null || solar === null) throw new Error("NASA climate signals incomplete");
        setSignals({ temperature, rainfall, solar });
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setSignals(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [latitude, longitude]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/varda?latitude=${latitude}&longitude=${longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 503 || data.configured === false) {
          setVarda({ status: "unconfigured" });
          return;
        }
        if (!response.ok) throw new Error(data.error);
        const fieldId = data.entries?.[0]?.field_id;
        setVarda({ status: "ready", fieldId: typeof fieldId === "string" ? fieldId : undefined });
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setVarda({ status: "unavailable" });
      });
    return () => controller.abort();
  }, [latitude, longitude]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/eosda?latitude=${latitude}&longitude=${longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (response.status === 503 || data.configured === false) {
          setEosdaState("unconfigured");
          return;
        }
        if (!response.ok) throw new Error(data.error);
        setEosdaState("ready");
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setEosdaState("unavailable");
      });
    return () => controller.abort();
  }, [latitude, longitude]);

  return (
    <section className="mt-8 rounded-[2rem] border border-[#c6ff7b]/20 bg-[#c6ff7b]/5 p-5 sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Crop intelligence</p><h2 className="mt-2 text-3xl font-semibold">What fits {locationName}?</h2></div>
        <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-[#8fa49a]">{loading ? "Reading NASA POWER…" : signals ? "NASA POWER climate fit" : "NASA signals unavailable"}</span>
      </div>
      <p className="mt-4 text-xs text-[#8fa49a]">EOSDA crop health: {eosdaState === "loading" ? "requesting NDVI…" : eosdaState === "ready" ? "NDVI analysis submitted for this field." : eosdaState === "unconfigured" ? "Add EOSDA_API_KEY to enable satellite health data." : "temporarily unavailable."}</p>
      <p className="mt-2 text-xs text-[#8fa49a]">Varda field ID: {varda.status === "loading" ? "looking up field…" : varda.status === "ready" ? varda.fieldId ?? "no registered field at this point." : varda.status === "unconfigured" ? "Add Varda credentials to enable field lookup." : "temporarily unavailable."}</p>
      {signals && <div className="mt-5 grid grid-cols-3 gap-2 text-xs text-[#9caf9f]"><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">NASA temperature<strong className="mt-1 block text-base text-[#c6ff7b]">{signals.temperature.toFixed(1)}°C</strong></div><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">NASA rainfall<strong className="mt-1 block text-base text-[#c6ff7b]">{signals.rainfall.toFixed(1)} mm/day</strong></div><div className="rounded-xl border border-white/10 bg-white/[0.04] p-3">NASA solar<strong className="mt-1 block text-base text-[#c6ff7b]">{signals.solar.toFixed(1)} kWh/m²</strong></div></div>}
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        {crops.map((crop, index) => { const score = signals ? scoreCrop(crop, signals) : null; const image = crop.image; return <article key={crop.name} className={`crop-card crop-card-${crop.tone} animate-[fade-up_500ms_ease-out_both]`} style={{ animationDelay: `${index * 100}ms` }}><div className="h-32 rounded-xl bg-cover bg-center" style={{ backgroundImage: `url("${image}")` }} role="img" aria-label={`${crop.name} crop image`} /><div className="mt-4 flex items-center justify-between"><span className="text-2xl">{index === 0 ? "✦" : index === 1 ? "◌" : "△"}</span><span className="text-[10px] font-bold uppercase tracking-widest">{score === null ? "Screening" : `${score}% climate fit`}</span></div><h3 className="mt-4 text-xl font-semibold">{crop.name}</h3><p className="mt-3 text-sm leading-6 text-[#c1d0c3]"><strong className="text-[#c6ff7b]">NASA fit:</strong> {signals ? `Based on ${signals.temperature.toFixed(1)}°C temperature, ${signals.rainfall.toFixed(1)} mm/day rainfall, and ${signals.solar.toFixed(1)} kWh/m² solar signal.` : crop.reason}</p><p className="mt-3 text-sm leading-6 text-[#9caf9f]"><strong className="text-amber-200">Watch:</strong> {crop.caution}</p></article>; })}
      </div>
      <p className="mt-5 text-xs leading-5 text-[#70887a]">These are explainable starting points, not prescriptions. Confirm soil tests, water rights, disease history, local markets, and planting windows with farmers or extension experts. Crop photos: Wikimedia Commons.</p>
    </section>
  );
}
