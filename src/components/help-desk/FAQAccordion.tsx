"use client";

import { ChevronDown, ShieldCheck } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { FAQItem } from "./types";

// ─── Single accordion item ────────────────────────────────────────────────────

interface FAQItemProps {
  faq: FAQItem;
  expanded: boolean;
  onToggle: () => void;
}

function FAQRow({ faq, expanded, onToggle }: FAQItemProps) {
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 py-3.5 text-left"
      >
        <span className={`text-[13px] font-bold leading-snug transition-colors
          ${expanded ? "text-indigo-700" : "text-slate-800 hover:text-indigo-600"}`}>
          {faq.question}
        </span>
        <ChevronDown
          size={15}
          className={`shrink-0 transition-transform ${expanded ? "rotate-180 text-indigo-500" : "text-slate-400"}`}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="mb-3.5 rounded-xl border border-indigo-100 bg-indigo-50/50 px-4 py-3 text-xs text-slate-600 leading-relaxed">
              {faq.answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── FAQ list ─────────────────────────────────────────────────────────────────

interface FAQAccordionProps {
  faqs: FAQItem[];
  expandedId: string | null;
  onToggle: (id: string) => void;
}

export function FAQAccordion({ faqs, expandedId, onToggle }: FAQAccordionProps) {
  if (faqs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50">
          <ShieldCheck size={24} className="text-slate-300" />
        </div>
        <p className="text-sm font-semibold text-slate-600">No FAQs yet</p>
        <p className="mt-1 text-xs text-slate-400">Our support team is compiling answers.</p>
      </div>
    );
  }

  return (
    <div>
      {faqs.map((faq) => (
        <FAQRow
          key={faq.id}
          faq={faq}
          expanded={expandedId === faq.id}
          onToggle={() => onToggle(faq.id)}
        />
      ))}
    </div>
  );
}
