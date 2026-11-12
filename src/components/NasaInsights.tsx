"use client";

import { useEffect, useState } from "react";
import { FieldLocation, NasaPowerData } from "./field-data";

function average(values?: Record<string, number>) {
  const valid = Object.values(values ?? {}).filter((value) => Number.isFinite(value));
  return valid.length ? valid.reduce((sum, value) => sum + value, 0) / valid.length : null;
}

export function NasaInsights({ location }: { location: FieldLocation }) {
  const [data, setData] = useState<NasaPowerData | null>(null);
  const [error, setError] = useState("");
  const [soilStatus, setSoilStatus] = useState<"loading" | "ready" | "unconfigured" | "unavailable">("loading");
  const [soilProperties, setSoilProperties] = useState<string[]>([]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/nasa-power?latitude=${location.latitude}&longitude=${location.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error("NASA data unavailable");
        return response.json() as Promise<NasaPowerData>;
      })
      .then(setData)
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError("Live NASA POWER data is temporarily unavailable. Showing the regional profile.");
      });
    return () => controller.abort();
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/soil-hive?latitude=${location.latitude}&longitude=${location.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (response.status === 503 || result.configured === false) {
          setSoilStatus("unconfigured");
          return;
        }
        if (!response.ok) throw new Error(result.error);
        const elements = result.data?.dataFeedElement;
        const properties = Array.isArray(elements)
          ? elements
            .flatMap((element: { item?: unknown }) => element.item && typeof element.item === "object" ? [element.item] : [])
            .flatMap((item: { dataFeedElement?: unknown }) => Array.isArray(item.dataFeedElement) ? item.dataFeedElement : [])
            .filter((item): item is { name: string; value: string | number; unitCode?: string } => typeof item?.name === "string" && (typeof item.value === "string" || typeof item.value === "number"))
            .slice(0, 3)
            .map((item) => `${item.name}: ${item.value}${item.unitCode ? ` ${item.unitCode}` : ""}`)
          : [];
        setSoilProperties(properties);
        setSoilStatus("ready");
      })
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setSoilStatus("unavailable");
      });
    return () => controller.abort();
  }, [location.latitude, location.longitude]);

  const temperature = average(data?.parameters.T2M);
  const precipitation = average(data?.parameters.PRECTOTCORR);
  const radiation = average(data?.parameters.ALLSKY_SFC_SW_DWN);
  const weatherDescription = temperature === null || precipitation === null
    ? `Live weather signals for ${location.country} are loading.`
    : temperature >= 27 && precipitation >= 3
      ? `${location.country} is showing a hot, moisture-rich pattern around ${temperature.toFixed(1)}°C. Prioritize drainage, disease scouting, and crops suited to a long warm season.`
      : temperature >= 27
        ? `${location.country} is showing hot and relatively dry conditions around ${temperature.toFixed(1)}°C. Favor heat-tolerant crops, soil cover, and careful irrigation timing.`
        : temperature <= 12 && precipitation < 2
          ? `${location.country} is showing a cool, dry pattern around ${temperature.toFixed(1)}°C. Protect establishment, preserve moisture, and use a longer-season plan.`
          : precipitation >= 3
            ? `${location.country} is showing a mild, wet pattern around ${temperature.toFixed(1)}°C. Watch drainage and fungal pressure while using the reliable moisture window.`
            : `${location.country} is showing a moderate seasonal pattern around ${temperature.toFixed(1)}°C with ${precipitation.toFixed(1)} mm/day rainfall. Balance water demand with soil protection.`;

  return (
    <section className="selected-location-panel animate-[fade-up_500ms_ease-out_both] rounded-[2rem] border p-6 sm:p-8">
      <div className="selected-location-head">
        <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#c6ff7b]">Selected location</p>
        <h2 className="mt-3 text-3xl font-semibold">{location.name}</h2>
        <p className="selected-location-coordinates mt-2">{location.country} · {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°</p>
        </div>
        <span className="panel-count">Live field profile</span>
      </div>
      <p className="selected-location-copy mt-4">{location.digest}</p>
      <p className="selected-weather-description"><strong>Weather reading:</strong> {weatherDescription}</p>
      <span className="selected-location-evidence">Regional evidence · {location.source}</span>
        {error && <p className="mt-4 text-xs text-amber-200">{error}</p>}
      <div className="selected-location-metrics">
        <Metric label="Avg temperature" value={temperature === null ? "Loading…" : `${temperature.toFixed(1)}°C`} detail="NASA POWER T2M" />
        <Metric label="Rainfall signal" value={precipitation === null ? "Loading…" : `${precipitation.toFixed(1)} mm/day`} detail="NASA POWER precipitation" />
        <Metric label="Solar energy" value={radiation === null ? "Loading…" : `${radiation.toFixed(1)} kWh/m²`} detail="NASA POWER radiation" />
      </div>
      <div className="selected-soil-profile">
        <p className="text-sm text-[#8fa49a]">Soil profile</p>
        <p className="mt-2">
          {soilStatus === "loading" ? "Reading SoilHive…" : soilStatus === "ready" ? soilProperties.join(" · ") || "SoilHive returned no summary properties." : soilStatus === "unconfigured" ? "Configure SoilHive credentials and IDs to enable global soil data." : "SoilHive is temporarily unavailable."}
        </p>
      </div>
    </section>
  );
}

function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return <div className="selected-location-metric"><p className="text-sm text-[#8fa49a]">{label}</p><strong>{value}</strong><span>{detail}</span></div>;
}
