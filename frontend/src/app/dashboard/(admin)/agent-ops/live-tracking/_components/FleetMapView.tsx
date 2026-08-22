"use client";

import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Truck, Phone, BatteryCharging, Package, MapPin } from "lucide-react";

interface Agent {
  id:               string;
  agentName:        string;
  phone:            string;
  currentStatus:    string;
  assignedZone:     string;
  lat:              number | string;
  lng:              number | string;
  lastPing:         string;
  activePickups:    number;
  activeDeliveries: number;
  batteryLevel:     string;
  vehicleNumber?:   string | null;
  vehicleType?:     string;
}

// Function to create custom colored markers for Leaflet based on status
function createStatusIcon(status: string) {
  const s = (status || "").toUpperCase();
  let color = "#10B981"; // green (AVAILABLE)
  if (s.includes("PICKUP")) color = "#3B82F6"; // blue
  else if (s.includes("DELIVERY")) color = "#8B5CF6"; // purple
  else if (s.includes("OFFLINE") || s.includes("INACTIVE")) color = "#64748B"; // slate
  else if (s.includes("BREAK")) color = "#F59E0B"; // amber

  const svgHtml = `
    <svg width="34" height="44" viewBox="0 0 34 44" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M17 0C7.61116 0 0 7.61116 0 17C0 29.75 17 44 17 44C17 44 34 29.75 34 17C34 7.61116 26.3888 0 17 0Z" fill="${color}"/>
      <circle cx="17" cy="17" r="11" fill="white"/>
      <path d="M12 17L17 12L22 17" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;

  return new L.DivIcon({
    html: svgHtml,
    className: "custom-leaflet-marker",
    iconSize: [34, 44],
    iconAnchor: [17, 44],
    popupAnchor: [0, -40],
  });
}

export default function FleetMapView({ agents }: { agents: Agent[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-[550px] rounded-3xl bg-muted animate-pulse" />;
  }

  // Calculate center from average of valid driver coordinates or default Dhaka
  const validAgents = agents.filter(
    (a) => !isNaN(Number(a.lat)) && !isNaN(Number(a.lng)) && Number(a.lat) !== 0
  );

  const center: [number, number] =
    validAgents.length > 0
      ? [
          validAgents.reduce((sum, a) => sum + Number(a.lat), 0) / validAgents.length,
          validAgents.reduce((sum, a) => sum + Number(a.lng), 0) / validAgents.length,
        ]
      : [23.8103, 90.4125]; // Default Dhaka center

  return (
    <div className="relative w-full h-[550px] rounded-3xl overflow-hidden border border-border shadow-sm z-0">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {validAgents.map((ag) => {
          const icon = createStatusIcon(ag.currentStatus);
          const lat = Number(ag.lat);
          const lng = Number(ag.lng);

          return (
            <Marker key={ag.id} position={[lat, lng]} icon={icon}>
              <Popup className="agent-map-popup">
                <div className="p-1 min-w-[200px] space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-xs">
                      {ag.agentName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs leading-tight">{ag.agentName}</h4>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Phone size={10} /> {ag.phone}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-slate-100 p-2 text-[11px] space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Zone:</span>
                      <strong className="text-slate-800">{ag.assignedZone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Status:</span>
                      <strong className="capitalize text-slate-800">
                        {ag.currentStatus.replace("_", " ").toLowerCase()}
                      </strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Active Jobs:</span>
                      <strong className="text-slate-800">
                        {ag.activePickups} pkp · {ag.activeDeliveries} drop
                      </strong>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
