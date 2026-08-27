"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  GoogleMap,
  useJsApiLoader,
  MarkerF,
  DirectionsRenderer,
  InfoWindowF,
} from "@react-google-maps/api";
import { OptimizedRoute } from "../types";

type RouteMapProps = {
  routes: OptimizedRoute[];
  agentLocation?: { lat: number; lng: number } | null;
  onDirectionsCalculated?: (drivingLegs: { distance: string; duration: string }[]) => void;
};

const mapContainerStyle = {
  width: "100%",
  height: "450px",
  borderRadius: "0.5rem",
};

const defaultCenter = {
  lat: 23.8103, // Dhaka default
  lng: 90.4125,
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

export default function RouteMap({ routes, agentLocation, onDirectionsCalculated }: RouteMapProps) {
  const apiKey = "AIzaSyCCLeLCRb3iuU8H6qwnqcx8XhHjc2cGJ7E";

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [selectedMarker, setSelectedMarker] = useState<OptimizedRoute | null>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const validStops = (routes || []).filter(
    (r): r is OptimizedRoute & { latitude: number; longitude: number } =>
      r.latitude !== null && r.longitude !== null
  );

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Calculate Google Directions route when stops or agent location change
  useEffect(() => {
    if (!isLoaded || validStops.length === 0 || !window.google) return;

    const directionsService = new google.maps.DirectionsService();

    // Determine Origin
    const origin = agentLocation
      ? { lat: agentLocation.lat, lng: agentLocation.lng }
      : { lat: validStops[0].latitude, lng: validStops[0].longitude };

    // Determine Destination (last stop)
    const destination = {
      lat: validStops[validStops.length - 1].latitude,
      lng: validStops[validStops.length - 1].longitude,
    };

    // Waypoints for intermediate stops between origin and destination
    const waypoints: google.maps.DirectionsWaypoint[] =
      validStops.length > 1
        ? validStops.slice(0, validStops.length - 1).map((stop) => ({
            location: new google.maps.LatLng(stop.latitude, stop.longitude),
            stopover: true,
          }))
        : [];

    directionsService.route(
      {
        origin,
        destination,
        waypoints,
        optimizeWaypoints: true,
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          setDirections(result);

          if (result.routes[0]?.legs && onDirectionsCalculated) {
            const legs = result.routes[0].legs.map((leg) => ({
              distance: leg.distance?.text || "N/A",
              duration: leg.duration?.text || "N/A",
            }));
            onDirectionsCalculated(legs);
          }
        } else {
          console.warn("Google Directions request failed:", status);
        }
      }
    );
  }, [isLoaded, validStops.length, agentLocation?.lat, agentLocation?.lng]);


  // Center map dynamically to fit bounds
  useEffect(() => {
    if (!map || validStops.length === 0 || !window.google) return;

    const bounds = new google.maps.LatLngBounds();

    if (agentLocation) {
      bounds.extend(new google.maps.LatLng(agentLocation.lat, agentLocation.lng));
    }

    validStops.forEach((s) => {
      bounds.extend(new google.maps.LatLng(s.latitude, s.longitude));
    });

    map.fitBounds(bounds, 60);
  }, [map, validStops, agentLocation]);

  if (loadError) {
    return (
      <div className="flex h-[400px] items-center justify-center bg-red-50 text-red-600 rounded-lg border border-red-200 p-4 text-center">
        <div>
          <p className="font-semibold text-base mb-1">Failed to load Google Maps</p>
          <p className="text-xs text-red-500">{loadError.message}</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex h-[450px] items-center justify-center bg-slate-100 rounded-lg text-slate-500 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Google Maps Navigation...</span>
        </div>
      </div>
    );
  }

  const centerPosition = agentLocation
    ? { lat: agentLocation.lat, lng: agentLocation.lng }
    : validStops.length > 0
    ? { lat: validStops[0].latitude, lng: validStops[0].longitude }
    : defaultCenter;

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={centerPosition}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* Agent Live GPS Location Marker */}
      {agentLocation && (
        <MarkerF
          position={{ lat: agentLocation.lat, lng: agentLocation.lng }}
          title="Your Current Location (Delivery Agent)"
          icon={{
            path: google.maps.SymbolPath.CIRCLE,
            scale: 9,
            fillColor: "#0284c7",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 3,
          }}
        />
      )}

      {/* Render Google Directions Polyline / Route */}
      {directions && (
        <DirectionsRenderer
          directions={directions}
          options={{
            suppressMarkers: true,
            polylineOptions: {
              strokeColor: "#2563eb",
              strokeWeight: 5,
              strokeOpacity: 0.8,
            },
          }}
        />
      )}

      {/* Render Customer Stop Markers */}
      {validStops.map((stop, index) => {
        const isPickup = stop.type === "PICKUP";

        return (
          <MarkerF
            key={stop.id || index}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            label={{
              text: `${index + 1}`,
              color: "#ffffff",
              fontWeight: "bold",
              fontSize: "12px",
            }}
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 14,
              fillColor: isPickup ? "#2563eb" : "#16a34a", // Blue for Pickup, Green for Drop-off
              fillOpacity: 1,
              strokeColor: "#ffffff",
              strokeWeight: 2,
            }}
            onClick={() => setSelectedMarker(stop)}
          />
        );
      })}

      {/* InfoWindow for selected stop */}
      {selectedMarker && selectedMarker.latitude && selectedMarker.longitude && (
        <InfoWindowF
          position={{ lat: selectedMarker.latitude, lng: selectedMarker.longitude }}
          onCloseClick={() => setSelectedMarker(null)}
        >
          <div className="p-1 max-w-xs text-xs space-y-1">
            <p className="font-bold text-slate-800 text-sm">{selectedMarker.routeName}</p>
            <p className="text-slate-600">{selectedMarker.endLocation}</p>
            <div className="flex items-center gap-2 pt-1">
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-semibold text-white ${
                  selectedMarker.type === "PICKUP" ? "bg-blue-600" : "bg-emerald-600"
                }`}
              >
                {selectedMarker.type || "Stop"}
              </span>
              <span className="text-slate-500 font-medium">{selectedMarker.estimatedTime}</span>
            </div>
            {selectedMarker.latitude && selectedMarker.longitude && (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${selectedMarker.latitude},${selectedMarker.longitude}&travelmode=driving`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold"
              >
                🧭 Open in Google Maps
              </a>
            )}
          </div>
        </InfoWindowF>
      )}
    </GoogleMap>
  );
}