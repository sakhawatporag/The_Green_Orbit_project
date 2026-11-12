"use client";

import { useEffect } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type MapPlace = { id: number; name: string; kind: string; latitude: number; longitude: number };
type Props = { latitude: number; longitude: number; places: MapPlace[]; onSelect: (latitude: number, longitude: number) => void };

const locationIcon = L.divIcon({ className: "custom-map-pin", html: "<span></span>", iconSize: [20, 20], iconAnchor: [10, 10] });
const placeIcon = L.divIcon({ className: "custom-place-pin", html: "<span>+</span>", iconSize: [22, 22], iconAnchor: [11, 11] });

function MapController({ latitude, longitude }: Pick<Props, "latitude" | "longitude">) {
  const map = useMap();
  useEffect(() => { map.flyTo([latitude, longitude], Math.max(map.getZoom(), 6), { duration: 1.2 }); }, [latitude, longitude, map]);
  return null;
}

function ClickHandler({ onSelect }: Pick<Props, "onSelect">) {
  useMapEvents({ click: (event) => onSelect(event.latlng.lat, event.latlng.lng) });
  return null;
}

export function AgroMap({ latitude, longitude, places, onSelect }: Props) {
  return (
    <div className="map-shell overflow-hidden rounded-3xl border border-white/10">
      <MapContainer center={[latitude, longitude]} zoom={5} scrollWheelZoom className="h-[420px] w-full">
        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <MapController latitude={latitude} longitude={longitude} />
        <ClickHandler onSelect={onSelect} />
        <Marker position={[latitude, longitude]} icon={locationIcon}><Popup>Selected analysis location</Popup></Marker>
        {places.map((place) => <Marker key={place.id} position={[place.latitude, place.longitude]} icon={placeIcon}><Popup><strong>{place.name}</strong><br />{place.kind}</Popup></Marker>)}
      </MapContainer>
    </div>
  );
}
