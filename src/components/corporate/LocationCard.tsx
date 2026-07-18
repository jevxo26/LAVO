import Link from "next/link";
import { Building2, MapPin, Phone, Clock } from "lucide-react";

interface LocationCardProps {
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  isVendor?: boolean;
}

export function LocationCard({ name, city, address, phone, hours, isVendor }: LocationCardProps) {
  return (
    <div className="flex flex-col bg-white rounded-[2rem] shadow-sm border border-slate-100 p-6 hover:shadow-md transition-shadow h-full">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">{name}</h3>
          <span className="text-blue-600 font-semibold text-sm">{city}</span>
        </div>
        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
          {isVendor ? <Building2 size={20} /> : <Building2 size={20} />}
        </div>
      </div>

      <div className="flex flex-col gap-3 mb-8 flex-grow">
        <div className="flex items-start gap-2 text-slate-600 text-sm">
          <MapPin size={16} className="mt-0.5 flex-shrink-0 text-slate-400" />
          <span className="leading-tight">{address}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Phone size={16} className="flex-shrink-0 text-slate-400" />
          <span>{phone}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600 text-sm">
          <Clock size={16} className="flex-shrink-0 text-slate-400" />
          <span>{hours}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-auto">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm py-2.5 rounded-full transition-colors text-center shadow-md shadow-blue-500/20">
          Schedule Pickup
        </button>
        <button className="flex-1 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 text-slate-700 font-semibold text-sm py-2.5 rounded-full transition-colors text-center">
          Get Directions
        </button>
      </div>
    </div>
  );
}
