"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Clock } from "lucide-react";

interface ServiceCardProps {
    id?: string;
    title: string;
    price: string;
    time: string;
    imageUrl: string;
}

const PricingCard = ({
    id = "dry-cleaning",
    title,
    price,
    time,
    imageUrl,
}: ServiceCardProps) => {
    return (
        <section
            className="group flex flex-col bg-card border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300"
        >
            {/* Image Section */}
            <div className="relative w-full h-40 bg-slate-100">
                <div className="relative w-full h-full  overflow-hidden">
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </div>

            {/* Content Section */}
            <div className="flex flex-col flex-grow p-6">
                <div className="flex flex-col mb-2">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {title}
                    </h3>

                    <span className="text-primary font-bold">
                        {price}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 mb-4">
                    <Clock size={14} />
                    <span className="text-xs font-medium">{time}</span>
                </div>

            </div>
        </section>
    );
}

export default PricingCard
