"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { OptimizedRoute } from "../types";

type RouteMapProps = {
  routes: OptimizedRoute[];
};
const DefaultIcon = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

L.Marker.prototype.options.icon = DefaultIcon;


const branchPosition: [number, number] = [23.8103, 90.4125];

const RouteMap = ({ routes }: RouteMapProps) => {
  const safeRoutes = routes ?? [];
  const validStops = safeRoutes.filter(
    (route): route is OptimizedRoute & { latitude: number; longitude: number } =>
      route.latitude !== null && route.longitude !== null
  );

  const polylinePositions: [number, number][] = [
    branchPosition, // Start at branch
    ...validStops.map((stop) => [stop.latitude, stop.longitude] as [number, number]),
  ];

  return (
    <MapContainer
      center={branchPosition}
      zoom={13}
      style={{ height: "400px", width: "100%", zIndex: 0 }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Branch Marker */}
      <Marker position={branchPosition}>
        <Popup><strong>LAVO Branch</strong><br/>Starting Point</Popup>
      </Marker>

      {/* Polyline Path */}
      {polylinePositions.length > 1 && (
        <Polyline 
          positions={polylinePositions} 
          pathOptions={{ color: 'blue', weight: 4, opacity: 0.7, dashArray: '10, 10' }} 
        />
      )}

      {/* Customer Locations */}
      {validStops.map((route, index) => {
        // Create a custom numbered icon
        const numberIcon = L.divIcon({
          className: "custom-div-icon",
          html: `<div style="background-color: ${route.type === 'PICKUP' ? '#3b82f6' : '#22c55e'}; color: white; border-radius: 50%; width: 24px; height: 24px; display: flex; justify-content: center; align-items: center; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);">${index + 1}</div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12]
        });

        return (
          <Marker
            key={route.id}
            position={[route.latitude, route.longitude]}
            icon={numberIcon}
          >
            <Popup>
              <strong>{route.routeName}</strong>
              <br />
              {route.endLocation}
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
};

export default RouteMap;