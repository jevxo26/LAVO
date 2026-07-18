"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
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
  return (
    <MapContainer
      center={branchPosition}
      zoom={13}
      style={{ height: "300px", width: "100%" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* Branch */}
      <Marker position={branchPosition}>
        <Popup>Branch</Popup>
      </Marker>

      {/* Customer Locations */}
      {safeRoutes
        .filter(
          (
            route
          ): route is OptimizedRoute & {
            latitude: number;
            longitude: number;
          } =>
            route.latitude !== null &&
            route.longitude !== null
        )
        .map((route) => (
          <Marker
            key={route.id}
            position={[route.latitude, route.longitude]}
          >
            <Popup>
              <strong>{route.routeName}</strong>
              <br />
              {route.endLocation}
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default RouteMap;