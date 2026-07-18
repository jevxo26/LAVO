import { MapPin } from "lucide-react";

interface CityCardProps {
  city: string;
  isAvailable?: boolean;
}

export function CityCard({ city, isAvailable = true }: CityCardProps) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
        <MapPin size={18} />
      </div>
      <div className="flex flex-col">
        <h3 className="font-bold text-slate-900 text-base leading-tight mb-1">{city}</h3>
        {isAvailable ? (
          <span className="text-emerald-500 font-semibold text-xs tracking-wide">Available</span>
        ) : (
          <span className="text-slate-400 font-semibold text-xs tracking-wide">Coming Soon</span>
        )}
      </div>
    </div>
  );
}
