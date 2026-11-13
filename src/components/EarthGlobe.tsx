"use client";

import { FieldLocation } from "./field-data";
import { countries } from "@/data/countries";

type Props = {
  locations: FieldLocation[];
  selectedLocation: number;
  onSelect: (index: number) => void;
  selectedCountry?: string;
  onCountrySelect?: (country: { id: string; name: string; lat: number; lon: number }) => void;
};

function countryPosition(latitude: number, longitude: number) {
  const left = Math.max(2, Math.min(98, ((longitude + 180) / 360) * 100));
  const top = Math.max(4, Math.min(94, ((90 - latitude) / 180) * 100));
  return { left: `${left}%`, top: `${top}%` };
}

export function EarthGlobe({ locations, selectedLocation, onSelect, selectedCountry, onCountrySelect }: Props) {
  return (
    <div className="earth-orbit relative mx-auto aspect-square w-full max-w-130 animate-[float_7s_ease-in-out_infinite]">
      <div className="absolute inset-0 rounded-full border border-[#c6ff7b]/10" />
      <div className="absolute inset-5 rounded-full border border-dashed border-[#c6ff7b]/15" />
      <div className="earth absolute inset-8 overflow-hidden rounded-full shadow-[0_0_90px_rgba(23,137,190,0.35),inset_-24px_-12px_42px_rgba(0,0,0,.7)]" aria-label="Rotating Earth with agricultural locations" role="img">
        <div className="earth-surface absolute inset-0">
          <div className="earth-texture absolute inset-0" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_20%,rgba(170,230,255,.24),transparent_22%),linear-gradient(110deg,transparent 34%,rgba(2,9,24,.76))]" />
          {locations.map((location, index) => (
            <button
              key={location.name}
              type="button"
              aria-label={`Show data for ${location.name}`}
              onClick={() => onSelect(index)}
              style={countryPosition(location.latitude, location.longitude)}
              className={`field-location absolute z-10 ${selectedLocation === index ? "field-location-active" : ""}`}
            >
              <span className="field-pin" style={{ backgroundColor: location.color }} />
              <span className="location-label">{location.shortName}</span>
            </button>
          ))}
          {onCountrySelect && Object.entries(countries).map(([id, country]) => {
            const position = countryPosition(country.lat, country.lon);
            const active = selectedCountry === id;
            return (
              <button
                key={id}
                type="button"
                title={`${country.name} · ${country.mainCrops.slice(0, 2).join(", ")}`}
                aria-label={`Explore ${country.name}`}
                onClick={() => onCountrySelect({ id, name: country.name, lat: country.lat, lon: country.lon })}
                style={{ left: position.left, top: position.top }}
                className={`country-pin absolute z-20 ${active ? "country-pin-active" : ""}`}
              >
                <span />
              </button>
            );
          })}
        </div>
        <div className="earth-atmosphere absolute inset-0" />
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center">
        <p className="text-[10px] uppercase tracking-[0.35em] text-[#c6ff7b]">NASA Blue Marble</p>
        <p className="mt-1 text-sm text-[#b8c5bb]">One planet · many fields</p>
      </div>
    </div>
  );
}
