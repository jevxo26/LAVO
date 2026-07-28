"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

interface ServiceCardProps {
  id?: string;
  title: string;
  price: string;
  unit: string;
  time: string;
  description: string;
  imageUrl: string;
}

export function ServiceCard({
  id = "dry-cleaning",
  title,
  price,
  unit,
  time,
  description,
  imageUrl,
}: ServiceCardProps) {
  return (
    <Link
      href={`/services/${id}`}
      className="group flex flex-col bg-card border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Image Section */}
      <div className="relative w-full h-56 bg-slate-100 p-2">
        <div className="relative w-full h-full rounded-[1.5rem] overflow-hidden">
          <Image
            src={imageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
            {title}
          </h3>
          <span className="text-primary font-bold">
            {price}
            <span className="text-sm font-medium">/{unit}</span>
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-slate-500 mb-4">
          <Clock size={14} />
          <span className="text-xs font-medium">{time}</span>
        </div>

        <p className="text-sm text-slate-600 mb-6 flex-grow">{description}</p>

        {/* Action Button */}
        <div className="flex items-center justify-between w-full px-6 py-3.5 bg-gradient-to-l from-blue-400 to-blue-500 text-white rounded-2xl font-semibold text-sm mt-auto shadow-md shadow-blue-500/20 transition-all duration-500 ease-out group-hover:shadow-lg group-hover:shadow-blue-500/40 group-hover:bg-gradient-to-r from-blue-400 to-blue-500 group-hover:-translate-y-0.5">
          <span>View Details</span>
          <div className="w-6 h-6 rounded-full bg-white text-blue-600 flex items-center justify-center shadow-sm transition-all duration-500 ease-out group-hover:scale-110">
            <ArrowRight
              size={14}
              className="transition-transform duration-500 ease-out group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
