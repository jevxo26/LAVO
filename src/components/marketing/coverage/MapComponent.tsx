"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin } from "lucide-react";

// Fix Leaflet marker icons issue in Next.js
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Since New York is mentioned in the design, I'll center it there, 
// though the grid items use Bangladesh cities. I'll center on NYC as requested.
const defaultCenter: [number, number] = [40.7128, -74.0060];

export default function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>;
  }

  return (
    <div className="relative w-full h-[400px] rounded-3xl overflow-hidden border border-slate-200 shadow-sm z-0">
      <MapContainer 
        center={defaultCenter} 
        zoom={11} 
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={defaultCenter} icon={customIcon}>
          <Popup>
            <div className="text-center">
              <strong className="block text-sm mb-1">New York City Coverage</strong>
              <span className="text-xs text-slate-500">Full coverage across 5 boroughs</span>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
      
      {/* Overlay text shown in the figma */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none bg-white/90 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border border-slate-100 flex flex-col items-center z-[1000]">
        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-2">
          <MapPin size={20} />
        </div>
        <h3 className="font-bold text-slate-900 mb-1">New York City Coverage Map</h3>
        <p className="text-xs text-slate-500">Full coverage across 5 boroughs and expanding</p>
      </div>
    </div>
  );
}
