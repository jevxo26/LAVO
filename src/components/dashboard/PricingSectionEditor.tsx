"use client";

import React, { useState } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  ShoppingBag,
  Wrench,
  Clock,
  Sparkles,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionWithItems = Prisma.CmsSectionGetPayload<{ include: { items: true } }>;

type PricingCategory = "garment" | "service" | "turnaround" | "addon";

type PricingRow = {
  id: string;
  name: string;
  /** basePrice for garment | addOn for service | multiplier for turnaround | price for addon */
  value: string;
  category: PricingCategory;
  displayOrder: number;
  isNew?: boolean;
  markedForDeletion?: boolean;
};

interface PricingSectionEditorProps {
  section: SectionWithItems;
  onClose: () => void;
  onSaved: () => void;
}

const TABS: { key: PricingCategory; label: string; icon: React.ReactNode; valueLabel: string; valuePlaceholder: string; hint: string }[] = [
  {
    key: "garment",
    label: "Garments",
    icon: <ShoppingBag size={16} />,
    valueLabel: "Base Price (৳)",
    valuePlaceholder: "e.g. 45",
    hint: "The base price for this garment type. Final price = (basePrice + serviceAddOn) × quantity × turnaroundMultiplier",
  },
  {
    key: "service",
    label: "Services",
    icon: <Wrench size={16} />,
    valueLabel: "Add-On Price (৳)",
    valuePlaceholder: "e.g. 25",
    hint: "Extra cost added on top of the garment base price when this service is selected.",
  },
  {
    key: "turnaround",
    label: "Turnarounds",
    icon: <Clock size={16} />,
    valueLabel: "Price Multiplier (×)",
    valuePlaceholder: "e.g. 1.5",
    hint: "Multiplier applied to the subtotal. 1 = standard price, 1.5 = 50% surcharge, 2 = double price.",
  },
  {
    key: "addon",
    label: "Add-ons",
    icon: <Sparkles size={16} />,
    valueLabel: "Price (৳)",
    valuePlaceholder: "e.g. 80",
    hint: "Individual add-on items displayed in the 'Customise Your Order' grid below the calculator.",
  },
];

// ─── Row Item Component ───────────────────────────────────────────────────────

function PricingRowItem({
  row,
  valueLabel,
  valuePlaceholder,
  onNameChange,
  onValueChange,
  onRemove,
}: {
  row: PricingRow;
  valueLabel: string;
  valuePlaceholder: string;
  onNameChange: (val: string) => void;
  onValueChange: (val: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-3 group bg-white border border-slate-200 rounded-xl px-4 py-3 hover:border-blue-200 transition-colors">
      {/* Drag handle visual */}
      <div className="flex flex-col gap-[3px] flex-shrink-0 opacity-30">
        <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
        <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
        <span className="w-3.5 h-0.5 bg-slate-400 rounded-full" />
      </div>

      {/* Name */}
      <input
        type="text"
        value={row.name}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Item name"
        className="flex-1 text-sm font-medium text-slate-800 border-0 outline-none bg-transparent placeholder:text-slate-300 min-w-0"
      />

      {/* Value input */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-[11px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">{valueLabel}</span>
        <input
          type="number"
          value={row.value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={valuePlaceholder}
          step="0.01"
          min="0"
          className="w-24 text-sm font-bold text-blue-600 text-right border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 bg-slate-50"
        />
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 opacity-0 group-hover:opacity-100"
        title="Remove item"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function PricingSectionEditor({ section, onClose, onSaved }: PricingSectionEditorProps) {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<PricingCategory>("garment");

  // Build initial rows from section items
  const buildRows = (items: SectionWithItems["items"]): PricingRow[] =>
    items
      .filter((i) => i.subtitle && ["garment", "service", "turnaround", "addon"].includes(i.subtitle))
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((i) => ({
        id: i.id,
        name: i.title ?? "",
        value: i.content ?? "0",
        category: i.subtitle as PricingCategory,
        displayOrder: i.displayOrder,
      }));

  const [rows, setRows] = useState<PricingRow[]>(buildRows(section.items));

  const rowsFor = (cat: PricingCategory) =>
    rows.filter((r) => r.category === cat && !r.markedForDeletion);

  const addRow = (cat: PricingCategory) => {
    const catRows = rowsFor(cat);
    setRows((prev) => [
      ...prev,
      {
        id: `temp-${Date.now()}`,
        name: "",
        value: cat === "turnaround" ? "1" : "0",
        category: cat,
        displayOrder: catRows.length + 1,
        isNew: true,
      },
    ]);
  };

  const updateRow = (id: string, field: "name" | "value", val: string) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, [field]: val } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        return r.isNew ? { ...r, markedForDeletion: true } : { ...r, markedForDeletion: true };
      })
    );
  };

  // Map category to CMS subtitle
  const categoryToSubtitle = (cat: PricingCategory) => cat;

  const saveChanges = async () => {
    setLoading(true);
    try {
      for (const row of rows) {
        if (row.markedForDeletion) {
          if (!row.isNew) {
            await axios.delete(`/api/cms/items/${row.id}`);
          }
        } else if (row.isNew) {
          await axios.post("/api/cms/items", {
            sectionId: section.id,
            title: row.name,
            subtitle: categoryToSubtitle(row.category),
            content: String(row.value),
            displayOrder: row.displayOrder,
          });
        } else {
          await axios.put(`/api/cms/items/${row.id}`, {
            title: row.name,
            subtitle: categoryToSubtitle(row.category),
            content: String(row.value),
            displayOrder: row.displayOrder,
          });
        }
      }
      toast.success("Pricing updated successfully");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save pricing changes");
    } finally {
      setLoading(false);
    }
  };

  const activeTabConfig = TABS.find((t) => t.key === activeTab)!;
  const activeRows = rowsFor(activeTab);

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* ── Header ── */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              Pricing Management
              <span className="text-blue-600 uppercase font-mono text-xs ml-1 bg-blue-50 px-2 py-0.5 rounded">calculator</span>
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Manage garments, services, turnaround options and add-ons displayed on the pricing page.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-4 gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-t-lg border-b-2 transition-all -mb-px ${
                activeTab === tab.key
                  ? "border-blue-600 text-blue-600 bg-blue-50/50"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className={`text-[11px] rounded-full px-1.5 py-0.5 font-bold ${
                activeTab === tab.key ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
              }`}>
                {rowsFor(tab.key).length}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">

          {/* Hint */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 leading-relaxed">
            <strong>{activeTabConfig.valueLabel}:</strong> {activeTabConfig.hint}
          </div>

          {/* Formula preview for garments tab */}
          {activeTab === "garment" && (
            <div className="bg-slate-800 text-slate-300 rounded-xl px-5 py-3 text-xs font-mono">
              Total = (<span className="text-blue-400">basePrice</span> + <span className="text-green-400">serviceAddOn</span>) × <span className="text-yellow-300">quantity</span> × <span className="text-pink-400">turnaroundMultiplier</span>
            </div>
          )}

          {/* Column Headers */}
          <div className="flex items-center gap-3 px-4 py-1">
            <div className="w-4 flex-shrink-0" />
            <span className="flex-1 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Name</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider w-24 text-right hidden sm:block">
              {activeTabConfig.valueLabel}
            </span>
            <div className="w-7 flex-shrink-0" />
          </div>

          {/* Rows */}
          <div className="space-y-2">
            {activeRows.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-slate-200 rounded-xl text-slate-400">
                <p className="text-sm mb-2">No {activeTabConfig.label.toLowerCase()} yet.</p>
                <button
                  onClick={() => addRow(activeTab)}
                  className="text-blue-600 text-sm font-medium hover:underline"
                >
                  Add the first one
                </button>
              </div>
            ) : (
              activeRows.map((row) => (
                <PricingRowItem
                  key={row.id}
                  row={row}
                  valueLabel={activeTabConfig.valueLabel}
                  valuePlaceholder={activeTabConfig.valuePlaceholder}
                  onNameChange={(val) => updateRow(row.id, "name", val)}
                  onValueChange={(val) => updateRow(row.id, "value", val)}
                  onRemove={() => removeRow(row.id)}
                />
              ))
            )}
          </div>

          {/* Add Row Button */}
          <button
            onClick={() => addRow(activeTab)}
            className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-slate-200 rounded-xl text-sm font-medium text-slate-500 hover:border-blue-300 hover:text-blue-600 hover:bg-blue-50/50 transition-all"
          >
            <Plus size={16} />
            Add {activeTabConfig.label.slice(0, -1)}
          </button>

        </div>

        {/* ── Footer ── */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            {rows.filter((r) => !r.markedForDeletion).length} total pricing items across all categories
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-sm font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? "Saving..." : "Save Pricing"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
