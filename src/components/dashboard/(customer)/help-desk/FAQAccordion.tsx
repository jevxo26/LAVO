"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle, Search, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQItem } from "./types";

// ─── Default Fallback FAQs ───────────────────────────────────────────────────

const DEFAULT_FAQS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I schedule an express laundry pickup?",
    answer: "Go to your dashboard, click 'Book Service', select your garments and preferred pickup time slot. Our agent will arrive at your address to collect your clothes.",
    category: "Orders",
  },
  {
    id: "faq-2",
    question: "What is the turnaround time for express cleaning?",
    answer: "Express laundry orders are processed and delivered within 12 to 24 hours. Standard laundry processing takes 48 hours from the time of pickup.",
    category: "Orders",
  },
  {
    id: "faq-3",
    question: "How do wallet top-ups and cashbacks work?",
    answer: "You can deposit funds into your LAVO Pay Wallet using Bkash, Nagad, or credit cards. Wallet payments get instant 1-tap checkout and earn bonus cashback points.",
    category: "Payments",
  },
  {
    id: "faq-4",
    question: "What safety protocols are followed for delicate garments?",
    answer: "Delicate items (silk, wool, embellished suits) undergo specialized eco-friendly dry cleaning with individual garment tagging and quality inspection prior to delivery.",
    category: "Garment Safety",
  },
  {
    id: "faq-5",
    question: "Can I cancel or reschedule my pickup request?",
    answer: "Yes! You can reschedule or cancel any pickup up to 1 hour before the scheduled agent arrival directly from the 'My Orders' section.",
    category: "Orders",
  },
];

interface FAQItemProps {
  faq: FAQItem;
  expanded: boolean;
  onToggle: () => void;
}

function FAQRow({ faq, expanded, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-4 text-left group"
      >
        <span
          className={`text-xs sm:text-sm font-extrabold leading-snug transition-colors
          ${expanded ? "text-indigo-600 dark:text-indigo-400" : "text-slate-800 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"}`}
        >
          {faq.question}
        </span>
        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-all ${expanded ? "bg-indigo-50 text-indigo-600 rotate-180 dark:bg-indigo-950/50 dark:text-indigo-400" : "bg-slate-50 text-slate-400 dark:bg-slate-800"}`}>
          <ChevronDown size={14} />
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mb-4 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 text-xs font-medium text-slate-700 leading-relaxed dark:bg-indigo-950/30 dark:border-indigo-900/60 dark:text-slate-300">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FAQAccordionProps {
  faqs: FAQItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function FAQAccordion({ faqs, expandedId, onToggle }: FAQAccordionProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const displayFaqs = faqs.length > 0 ? faqs : DEFAULT_FAQS;

  const categories = ["All", ...Array.from(new Set(displayFaqs.map((f) => f.category || "General")))];

  const filteredFaqs = displayFaqs.filter((f) => {
    const matchesSearch =
      f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = activeCategory === "All" || (f.category || "General") === activeCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-3 text-slate-400" />
        <input
          type="text"
          placeholder="Search FAQs & help topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 rounded-2xl border border-slate-200 bg-slate-50/80 pl-10 pr-4 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white focus:outline-none transition-all dark:bg-slate-800/80 dark:border-slate-700 dark:text-white"
        />
      </div>

      {/* Category Pills */}
      {categories.length > 1 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1 rounded-xl text-[11px] font-extrabold transition-all ${
                activeCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Accordion Rows */}
      <div className="pt-2">
        {filteredFaqs.length === 0 ? (
          <div className="py-10 text-center text-xs text-slate-400 font-medium">
            No matching FAQs found for "{searchQuery}".
          </div>
        ) : (
          filteredFaqs.map((faq) => (
            <FAQRow
              key={faq.id}
              faq={faq}
              expanded={expandedId === faq.id}
              onToggle={() => onToggle(faq.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
