"use client";

import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("@/components/coverage/MapComponent"), {
  ssr: false,
  loading: () => <div className="w-full h-[400px] bg-slate-100 rounded-3xl animate-pulse"></div>
});

export default function MapWrapper() {
  return <MapComponent />;
}
