"use client";

import { useEffect, useState } from "react";

type Country = {
  id: string;
  name: string;
  code: string;
  region: string;
  lat: number;
  lon: number;
  mainCrops: string[];
};

type Props = {
  selectedCountry: string;
  onSelect: (country: Country) => void;
};

export function CountryExplorer({ selectedCountry, onSelect }: Props) {
  const [countries, setCountries] = useState<Country[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/countries")
      .then((response) => response.json())
      .then((payload: { data?: Country[] }) => setCountries(payload.data ?? []))
      .catch(() => setCountries([]))
      .finally(() => setLoading(false));
  }, []);

  const selected = countries.find((country) => country.id === selectedCountry);

  return (
    <section className="mt-8 rounded-[2rem] border border-white/10 bg-[#0c241b]/80 p-5 shadow-2xl backdrop-blur sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Country intelligence</p>
          <h2 className="mt-2 text-3xl font-semibold">Compare national crop systems</h2>
          <p className="mt-3 text-sm leading-6 text-[#8fa49a]">Choose a country from the agricultural catalog to center the map and request its latest NASA POWER telemetry.</p>
        </div>
        <label className="text-sm text-[#b8c5bb]">
          Select country
          <select
            value={selectedCountry}
            onChange={(event) => {
              const country = countries.find((item) => item.id === event.target.value);
              if (country) onSelect(country);
            }}
            disabled={loading || countries.length === 0}
            className="mt-2 block w-full rounded-xl border border-white/15 bg-[#10291f] px-4 py-3 text-white outline-none transition focus:border-[#c6ff7b] disabled:opacity-50"
          >
            {loading ? <option>Loading countries…</option> : countries.map((country) => <option key={country.id} value={country.id}>{country.name}</option>)}
          </select>
        </label>
      </div>
      {selected && (
        <div className="mt-6 grid gap-3 sm:grid-cols-[0.7fr_1.3fr]">
          <div className="rounded-2xl border border-[#c6ff7b]/20 bg-[#c6ff7b]/5 p-5">
            <p className="text-sm text-[#8fa49a]">{selected.code} · {selected.region}</p>
            <p className="mt-2 text-xl font-semibold">{selected.name}</p>
            <p className="mt-3 text-xs text-[#70887a]">Reference point: {selected.lat.toFixed(2)}°, {selected.lon.toFixed(2)}°</p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-[#8fa49a]">Main crops from the country profile</p>
            <div className="mt-3 flex flex-wrap gap-2">{selected.mainCrops.map((crop) => <span key={crop} className="rounded-full border border-[#c6ff7b]/25 bg-[#c6ff7b]/10 px-3 py-1.5 text-sm text-[#d3e2d3]">{crop}</span>)}</div>
          </div>
        </div>
      )}
    </section>
  );
}
