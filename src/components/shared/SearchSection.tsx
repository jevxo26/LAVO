"use client";

import { motion } from "framer-motion";
import { Search, MapPin } from "lucide-react";

interface SearchSectionProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export function SearchSection({ placeholder = "Search your city or zip code...", onSearch }: SearchSectionProps) {
  return (
    <div className="w-full -mt-8 relative z-20 px-4 flex justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="w-full max-w-2xl bg-white rounded-full shadow-lg border border-slate-100 p-2 flex items-center"
      >
        <div className="pl-4 text-slate-400">
          <Search size={18} />
        </div>
        <input 
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-slate-700 placeholder:text-slate-400"
        />
        <div className="pr-4 border-r border-slate-200 text-slate-400">
          <MapPin size={18} />
        </div>
        <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-6 py-2.5 rounded-full ml-2 transition-colors">
          Search
        </button>
      </motion.div>
    </div>
  );
}
