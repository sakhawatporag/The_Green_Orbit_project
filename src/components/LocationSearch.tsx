"use client";

import { FormEvent, useState } from "react";
import { countries } from "@/data/countries";

type Result = { name: string; country: string; latitude: number; longitude: number };
type Props = { onSelect: (result: Result) => void };

export function LocationSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("Iowa, United States");
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCountries, setShowCountries] = useState(false);

  async function search(event: FormEvent) {
    event.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      setResults(data);
      if (!data.length) setError("No matching location found.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Search failed.");
    } finally { setLoading(false); }
  }

  const countryOptions = Object.entries(countries).filter(([, country]) => country.name.toLowerCase().includes(query.trim().toLowerCase()));

  return <div className="location-search relative space-y-3">
    <form onSubmit={search} className="flex gap-2">
      <input value={query} onFocus={() => { setShowCountries(true); setQuery(""); }} onChange={(event) => { setQuery(event.target.value); setShowCountries(true); }} aria-label="Search for a location" placeholder="Search city, country, or coordinates" className="min-w-0 flex-1 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-[#c6ff7b]" />
      <button disabled={loading} className="rounded-xl bg-[#c6ff7b] px-4 py-3 text-sm font-bold text-[#102218] disabled:opacity-50">{loading ? "Searching…" : "Search"}</button>
    </form>
    {showCountries && <div className="country-options absolute left-0 right-0 top-[calc(100%-4px)] z-30 max-h-72 overflow-y-auto rounded-xl border border-white/15 bg-[#10291f] p-2 shadow-2xl">
      <p className="px-3 py-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8fa49a]">{countryOptions.length} countries · choose a country</p>
      {countryOptions.map(([id, country]) => <button key={id} type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { onSelect({ name: country.name, country: country.name, latitude: country.lat, longitude: country.lon }); setQuery(country.name); setShowCountries(false); setResults([]); }} className="block w-full rounded-lg px-3 py-2 text-left text-sm text-[#d3e2d3] transition hover:bg-[#c6ff7b]/15 hover:text-[#c6ff7b]">{country.name}</button>)}
      {!countryOptions.length && <p className="px-3 py-3 text-sm text-[#8fa49a]">No country matches. Press Search to look up a city or region.</p>}
    </div>}
    {error && <p className="text-sm text-amber-200">{error}</p>}
    {results.length > 0 && <div className="grid gap-2">{results.map((result) => <button key={`${result.latitude}-${result.longitude}`} onClick={() => { onSelect(result); setResults([]); setQuery(result.name); setShowCountries(false); }} className="rounded-xl border border-white/10 bg-white/5 p-3 text-left text-sm text-[#d3e2d3] transition hover:border-[#c6ff7b]/50">{result.name}</button>)}</div>}
  </div>;
}
