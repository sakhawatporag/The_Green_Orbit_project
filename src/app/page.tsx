"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { CropAdvisor } from "@/components/CropAdvisor";
import { CountryExplorer } from "@/components/CountryExplorer";
import { CountryShowcase } from "@/components/CountryShowcase";
import { DataSources } from "@/components/DataSources";
import { EarthGlobe } from "@/components/EarthGlobe";
import { EarthStory } from "@/components/EarthStory";
import { FieldLocation, locations } from "@/components/field-data";
import { LocationSearch } from "@/components/LocationSearch";
import { NasaGallery } from "@/components/NasaGallery";
import { NasaInsights } from "@/components/NasaInsights";
import { ScrollReveal } from "@/components/ScrollReveal";
import { countries } from "@/data/countries";
import type { MapPlace } from "@/components/AgroMap";

const AgroMap = dynamic(() => import("@/components/AgroMap").then((module) => module.AgroMap), {
  ssr: false,
  loading: () => <div className="map-loading">Loading live map…</div>,
});

const defaultRotations = [
  { name: "Soil builder", sequence: "Corn → Cover crop → Soybean", water: 71, soil: 88, resilience: 81, yield: 76 },
  { name: "Dry-season buffer", sequence: "Sorghum → Clover → Winter wheat", water: 86, soil: 79, resilience: 91, yield: 69 },
  { name: "Current rotation", sequence: "Corn → Soybean", water: 42, soil: 58, resilience: 54, yield: 72 },
];

function countryScore(country: string) {
  return [...country].reduce((score, character) => score + character.charCodeAt(0), 0);
}

function plannerRotations(crops: string[] | undefined, country = "Selected region") {
  if (!crops?.length) return defaultRotations;
  const [first, second, third] = crops;
  const score = countryScore(country);
  const adjust = (base: number, range: number) => base + (score % range) - Math.floor(range / 2);
  return [
    { name: "Soil builder", sequence: `${first} → Cover crop → ${second ?? first}`, water: adjust(71, 13), soil: adjust(88, 9), resilience: adjust(81, 15), yield: adjust(76, 17) },
    { name: "Climate buffer", sequence: `${third ?? first} → Legume cover → ${first}`, water: adjust(86, 13), soil: adjust(79, 9), resilience: adjust(91, 15), yield: adjust(69, 17) },
    { name: "Current rotation", sequence: `${first} → ${second ?? first}`, water: adjust(42, 13), soil: adjust(58, 9), resilience: adjust(54, 15), yield: adjust(72, 17) },
  ];
}

function locationFromResult(name: string, latitude: number, longitude: number, country = "Selected region"): FieldLocation {
  return {
    name,
    country,
    shortName: "Selected field",
    latitude,
    longitude,
    position: "left-[48%] top-[48%]",
    color: "#b7f36b",
    soil: "NASA API",
    rain: "NASA API",
    digest: "NASA observations are combined with nearby agriculture and circular-economy infrastructure.",
    source: "NASA POWER + SMAP + ECOSTRESS + GPM",
  };
}

export default function Home() {
  const [location, setLocation] = useState(locations[0]);
  const [places, setPlaces] = useState<MapPlace[]>([]);
  const [placesError, setPlacesError] = useState("");
  const [hasExplored, setHasExplored] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [selectedLocationIndex, setSelectedLocationIndex] = useState(0);
  const [waterPriority, setWaterPriority] = useState(68);
  const [soilPriority, setSoilPriority] = useState(82);
  const [scrollProgress, setScrollProgress] = useState(0);
  const countryId = Object.entries(countries).find(([, item]) => item.name === location.country)?.[0];
  const country = countryId ? countries[countryId] : undefined;
  const rotations = useMemo(() => plannerRotations(country?.mainCrops, location.country), [country?.mainCrops, location.country]);
  const recommendation = useMemo(() => waterPriority > soilPriority + 12 ? rotations[1] : rotations[0], [rotations, soilPriority, waterPriority]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/places?latitude=${location.latitude}&longitude=${location.longitude}`, { signal: controller.signal })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        return data.places as MapPlace[];
      })
      .then(setPlaces)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === "AbortError")) setPlacesError(reason instanceof Error ? reason.message : "Nearby places unavailable.");
      });
    return () => controller.abort();
  }, [location.latitude, location.longitude]);

  useEffect(() => {
    if (!isUnlocking) return;
    const timer = window.setTimeout(() => {
      setIsUnlocking(false);
      setHasExplored(true);
    }, 1500);
    return () => window.clearTimeout(timer);
  }, [isUnlocking]);

  useEffect(() => {
    function updateScrollProgress() {
      const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(scrollableHeight > 0 ? (window.scrollY / scrollableHeight) * 100 : 0);
    }
    updateScrollProgress();
    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    window.addEventListener("resize", updateScrollProgress);
    return () => {
      window.removeEventListener("scroll", updateScrollProgress);
      window.removeEventListener("resize", updateScrollProgress);
    };
  }, []);

  function explore(name: string, latitude: number, longitude: number, selectedCountry: string) {
    setPlaces([]);
    setPlacesError("");
    setHasExplored(false);
    setIsUnlocking(true);
    setLocation(locationFromResult(name, latitude, longitude, selectedCountry));
  }

  function selectMap(latitude: number, longitude: number) {
    explore(`${latitude.toFixed(3)}, ${longitude.toFixed(3)}`, latitude, longitude, "Selected region");
  }

  function selectGlobeLocation(index: number) {
    const selected = locations[index];
    setSelectedLocationIndex(index);
    explore(selected.name, selected.latitude, selected.longitude, selected.country);
  }

  function selectCountry(country: { name: string; lat: number; lon: number }) {
    explore(country.name, country.lat, country.lon, country.name);
  }

  function selectSearchResult(result: { name: string; latitude: number; longitude: number; country: string }) {
    explore(result.name, result.latitude, result.longitude, result.country);
  }

  return (
    <main className="site-shell">
      <div className="scroll-progress" aria-hidden="true"><span style={{ width: `${scrollProgress}%` }} /></div>
      <header className="site-header">
        <a className="brand" href="#top"><span className="brand-mark">A</span><span>The green Orbit</span></a>
        <nav className="header-links"><a href="#overview">Overview</a><a href="#crops">Crops</a><a href="#sources">Sources</a></nav>
        <span className="status-pill"><i /> NASA connected</span>
      </header>

      <section id="top" className="hero-section">
        <div className="hero-copy">
          <p className="eyebrow">NASA Earth intelligence</p>
          <h1>Better decisions<br /><span>start with place.</span></h1>
          <p className="hero-lede">Explore local weather, crops, farming systems, and circular energy with one clear view of Earth.</p>
          <LocationSearch onSelect={selectSearchResult} />
          {isUnlocking && <div className="nasa-connection" role="status" aria-live="polite">
            <div className="nasa-connection-orbit" aria-hidden="true"><span /><i /><b>✦</b></div>
            <div className="nasa-connection-copy"><strong>Connecting to Earth intelligence</strong><span>Locating field coordinates · syncing NASA signals · preparing your insights</span></div>
            <div className="nasa-connection-pulse" aria-hidden="true" />
          </div>}
          <p className="helper-text">Search a city, country, region, or coordinates.</p>
        </div>
        <div className="hero-globe"><EarthGlobe locations={locations} selectedLocation={selectedLocationIndex} onSelect={selectGlobeLocation} selectedCountry={countryId} onCountrySelect={selectCountry} /></div>
      </section>

      <div className={`dashboard ${hasExplored ? "dashboard-visible" : ""}`}>
        <ScrollReveal><section id="overview" className="location-strip">
          <div><p className="eyebrow">Selected area</p><h2>{location.name}</h2><p>{location.country} · {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°</p></div>
        </section></ScrollReveal>

        <ScrollReveal delay={80}><CountryExplorer selectedCountry={countryId ?? ""} onSelect={selectCountry} /></ScrollReveal>
        <ScrollReveal delay={120}><NasaGallery key={`satellite-${location.country}-${location.latitude}`} query={`${location.country} satellite Earth observation`} /></ScrollReveal>

        <ScrollReveal delay={160}><section className="map-weather-grid">
          <div className="panel map-panel"><div className="panel-heading"><div><p className="eyebrow">Live map</p><h2>What is nearby?</h2></div><span className="panel-count">{places.length} places</span></div><AgroMap latitude={location.latitude} longitude={location.longitude} places={places} onSelect={selectMap} /></div>
          <NasaInsights key={`${location.latitude}-${location.longitude}`} location={location} />
        </section></ScrollReveal>

        <ScrollReveal delay={200}><CountryShowcase key={`showcase-${location.country}`} country={location.country} locationName={location.name} /></ScrollReveal>
        <ScrollReveal delay={240}><section id="crops"><CropAdvisor key={`${location.country}-${location.latitude}`} country={location.country} locationName={location.name} latitude={location.latitude} longitude={location.longitude} /></section></ScrollReveal>

        <ScrollReveal delay={300}><section key={`planner-${location.country}`} className="panel planner-panel planner-updated">
          <div className="panel-heading"><div><p className="eyebrow">Decision planner</p><h2>What should you plant next?</h2></div><span className="panel-count">Analysis for {location.name}</span></div>
          <div className="planner-grid"><div className="controls"><label>Water conservation <strong>{waterPriority}%</strong><input type="range" min="0" max="100" value={waterPriority} onChange={(event) => setWaterPriority(Number(event.target.value))} /></label><label>Soil health <strong>{soilPriority}%</strong><input type="range" min="0" max="100" value={soilPriority} onChange={(event) => setSoilPriority(Number(event.target.value))} /></label><div className="recommendation"><b>Suggested action for {location.country}</b><span>{recommendation.name}</span><small>{recommendation.sequence}</small><small>Water efficiency {recommendation.water}% · Soil health {recommendation.soil}% · Yield outlook {recommendation.yield}%</small></div></div><div className="rotation-list">{rotations.map((rotation) => <div className="rotation-card" key={rotation.name}><div><b>{rotation.name}</b><span>{rotation.sequence}</span><small>Water {rotation.water}% · Soil {rotation.soil}% · Yield {rotation.yield}%</small></div><strong>{rotation.resilience}%<small> resilience</small></strong></div>)}</div></div>
        </section></ScrollReveal>

        <ScrollReveal delay={340}><section className="panel facilities-panel"><div className="panel-heading"><div><p className="eyebrow">Local systems</p><h2>Food and circular energy</h2></div></div>{placesError && <p className="error-text">{placesError}</p>}<div className="facility-grid">{places.length ? places.slice(0, 8).map((place) => <div className="facility-card" key={place.id}><b>{place.name}</b><span>{place.kind}</span></div>) : <div className="facility-card"><b>Loading nearby facilities…</b><span>OpenStreetMap</span></div>}</div></section></ScrollReveal>
        <ScrollReveal delay={380}><EarthStory country={location.country} locationName={location.name} /></ScrollReveal>
        <ScrollReveal delay={420}><section id="sources" className="sources-section"><div><p className="eyebrow">Transparent science</p><h2>Built from open data.</h2><p>NASA POWER provides climate signals. OpenStreetMap adds nearby facilities and local context.</p></div><DataSources /></section></ScrollReveal>
        <footer className="site-footer">AgroSpace Insights · 2026 NASA Space Apps Challenge · Decision support, not a substitute for local expertise.</footer>
      </div>
    </main>
  );
}
