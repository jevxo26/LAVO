"use client";

import React, { useState } from "react";
import {
  X,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  Sparkles,
  Layers,
  Image as ImageIcon,
  ExternalLink,
  MoveUp,
  MoveDown,
  Copy,
  Sliders,
  CheckCircle2,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { Prisma } from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type SectionWithItems = Prisma.CmsSectionGetPayload<{ include: { items: true } }>;

export interface HeroSlideData {
  id: number | string;
  badge: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  primaryBtn: {
    label: string;
    href: string;
  };
  secondaryBtn: {
    label: string;
    href: string;
  };
  features: {
    title: string;
    icon: string;
  }[];
  floatingCard: {
    icon: string;
    title: string;
    value: string;
    subtitle?: string;
    position: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  };
}

export const DEFAULT_HERO_SLIDES: HeroSlideData[] = [
  {
    id: 1,
    badge: "Modern Laundry Platform",
    title: "Clean Clothes",
    highlight: "Without the Hassle",
    description:
      "Professional washing, dry cleaning, ironing and doorstep delivery with smart scheduling and transparent pricing.",
    image: "/images/home/hero/hero-1.jpg",
    primaryBtn: {
      label: "Corporate Solutions",
      href: "/corporate",
    },
    secondaryBtn: {
      label: "Become a Partner",
      href: "/partner",
    },
    features: [
      { title: "Doorstep Pickup", icon: "Truck" },
      { title: "Premium Care", icon: "Shield" },
      { title: "Easy Booking", icon: "CheckCircle" },
      { title: "Nearby Branches", icon: "MapPin" },
    ],
    floatingCard: {
      icon: "Star",
      title: "Customer Rating",
      value: "4.9",
      subtitle: "12k+ Reviews",
      position: "bottom-right",
    },
  },
  {
    id: 2,
    badge: "Trusted by Thousands",
    title: "Track Every",
    highlight: "Laundry Order",
    description:
      "Real-time QR tracking lets you monitor your garments from pickup to washing, ironing and final delivery.",
    image: "/images/home/hero/hero-2.jpg",
    primaryBtn: {
      label: "View Pricing",
      href: "/pricing",
    },
    secondaryBtn: {
      label: "Find Branch",
      href: "/branches",
    },
    features: [
      { title: "Real-time Status", icon: "QrCode" },
      { title: "Secure Process", icon: "Shield" },
      { title: "Fast Delivery", icon: "Truck" },
      { title: "Live Updates", icon: "MapPin" },
    ],
    floatingCard: {
      icon: "QrCode",
      title: "QR Tracking",
      value: "Live",
      subtitle: "Instant Updates",
      position: "top-right",
    },
  },
  {
    id: 3,
    badge: "Serving 22 Cities • 48 Branches",
    title: "Smart Laundry",
    highlight: "Perfectly Delivered.",
    description:
      "Book pickups, track every garment with QR technology and enjoy fast, reliable laundry services from your nearest branch.",
    image: "/images/home/hero/hero-3.jpg",
    primaryBtn: {
      label: "Book Pickup",
      href: "/services",
    },
    secondaryBtn: {
      label: "Explore Services",
      href: "/services",
    },
    features: [
      { title: "QR Tracking", icon: "QrCode" },
      { title: "Secure Payment", icon: "Shield" },
      { title: "Pickup & Delivery", icon: "Truck" },
      { title: "Verified Quality", icon: "CheckCircle" },
    ],
    floatingCard: {
      icon: "Truck",
      title: "Pickup",
      value: "Scheduled",
      subtitle: "On-Time Dispatch",
      position: "top-left",
    },
  },
];

interface HeroSectionEditorProps {
  section: SectionWithItems;
  onClose: () => void;
  onSaved: () => void;
}

export function HeroSectionEditor({ section, onClose, onSaved }: HeroSectionEditorProps) {
  const [loading, setLoading] = useState(false);

  // Parse initial slides from section.content JSON
  const initialSlides = React.useMemo(() => {
    if (section.content) {
      try {
        const parsed = JSON.parse(section.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed as HeroSlideData[];
        }
        if (parsed.slides && Array.isArray(parsed.slides)) {
          return parsed.slides as HeroSlideData[];
        }
      } catch (err) {
        console.warn("Could not parse hero slides JSON, using default slides", err);
      }
    }
    return DEFAULT_HERO_SLIDES;
  }, [section.content]);

  const [slides, setSlides] = useState<HeroSlideData[]>(initialSlides);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  const activeSlide = slides[activeSlideIndex] || slides[0];

  // Helper to update active slide
  const updateActiveSlide = (updater: (prev: HeroSlideData) => HeroSlideData) => {
    setSlides((prev) => {
      const copy = [...prev];
      if (copy[activeSlideIndex]) {
        copy[activeSlideIndex] = updater(copy[activeSlideIndex]);
      }
      return copy;
    });
  };

  const addSlide = () => {
    const newSlide: HeroSlideData = {
      id: Date.now(),
      badge: "New Feature / Announcement",
      title: "New Headline",
      highlight: "Special Offer",
      description: "Describe your new service, promotion, or campaign details here.",
      image: "/images/home/hero/hero-1.jpg",
      primaryBtn: {
        label: "Book Now",
        href: "/services",
      },
      secondaryBtn: {
        label: "Learn More",
        href: "/story",
      },
      features: [
        { title: "Instant Booking", icon: "CheckCircle" },
        { title: "Live Tracking", icon: "QrCode" },
        { title: "Doorstep Care", icon: "Truck" },
        { title: "Satisfaction Guarantee", icon: "Shield" },
      ],
      floatingCard: {
        icon: "Star",
        title: "Rating",
        value: "5.0",
        subtitle: "Verified Quality",
        position: "bottom-right",
      },
    };
    setSlides((prev) => [...prev, newSlide]);
    setActiveSlideIndex(slides.length);
  };

  const duplicateSlide = (index: number) => {
    const target = slides[index];
    if (!target) return;
    const duplicated: HeroSlideData = {
      ...JSON.parse(JSON.stringify(target)),
      id: Date.now(),
      title: `${target.title} (Copy)`,
    };
    setSlides((prev) => {
      const copy = [...prev];
      copy.splice(index + 1, 0, duplicated);
      return copy;
    });
    setActiveSlideIndex(index + 1);
  };

  const removeSlide = (index: number) => {
    if (slides.length <= 1) {
      toast.error("At least one slide must remain in the hero section.");
      return;
    }
    setSlides((prev) => prev.filter((_, i) => i !== index));
    setActiveSlideIndex((prev) => (prev >= index ? Math.max(0, prev - 1) : prev));
  };

  const moveSlide = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= slides.length) return;
    setSlides((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    setActiveSlideIndex(targetIdx);
  };

  const saveChanges = async () => {
    setLoading(true);
    try {
      // First slide title/highlight as main section title/subtitle for quick CMS list glance
      const firstSlide = slides[0];
      const mainTitle = firstSlide ? `${firstSlide.title} ${firstSlide.highlight}` : section.title;
      const mainSubtitle = firstSlide?.description || section.subtitle;

      // Save to CmsSection
      await axios.post("/api/cms/sections", {
        pageId: section.pageId,
        sectionKey: section.sectionKey,
        title: mainTitle,
        subtitle: mainSubtitle,
        content: JSON.stringify(slides, null, 2),
        displayOrder: section.displayOrder,
      });

      toast.success("Homepage Hero slider updated successfully!");
      onSaved();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save hero section changes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white flex items-center justify-center shadow-md">
              <Sliders size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900">Homepage Hero Slider Editor</h2>
                <span className="text-[10px] font-black font-mono uppercase bg-blue-100 text-blue-700 px-2 py-0.5 rounded-md">
                  hero.slider
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Customize titles, gradient highlights, badges, buttons, images, feature pills, and floating cards for every slide.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* ── Slide Navigation Bar ── */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/50 px-6 py-2.5 overflow-x-auto gap-2">
          <div className="flex items-center gap-1.5">
            {slides.map((slide, idx) => {
              const isActive = activeSlideIndex === idx;
              return (
                <div key={slide.id || idx} className="flex items-center group">
                  <button
                    onClick={() => setActiveSlideIndex(idx)}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Layers size={13} className={isActive ? "text-white" : "text-slate-400"} />
                    Slide {idx + 1}
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                        isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {slide.title?.slice(0, 10) || `Slide`}…
                    </span>
                  </button>
                </div>
              );
            })}

            <button
              onClick={addSlide}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors"
            >
              <Plus size={13} /> Add Slide
            </button>
          </div>

          {/* Active slide quick actions */}
          {activeSlide && (
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => moveSlide(activeSlideIndex, "up")}
                disabled={activeSlideIndex === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-slate-200 transition-colors disabled:opacity-30"
                title="Move Left"
              >
                <MoveUp size={13} className="-rotate-90" />
              </button>
              <button
                onClick={() => moveSlide(activeSlideIndex, "down")}
                disabled={activeSlideIndex === slides.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-white rounded-lg border border-slate-200 transition-colors disabled:opacity-30"
                title="Move Right"
              >
                <MoveDown size={13} className="-rotate-90" />
              </button>
              <button
                onClick={() => duplicateSlide(activeSlideIndex)}
                className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition-colors"
                title="Duplicate Slide"
              >
                <Copy size={13} />
              </button>
              <button
                onClick={() => removeSlide(activeSlideIndex)}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg border border-slate-200 transition-colors"
                title="Delete Slide"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}
        </div>

        {/* ── Scrollable Form ── */}
        {activeSlide ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">

            {/* Live Headline Preview Box */}
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 to-indigo-950 p-5 text-white shadow-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold text-blue-200">
                  <Sparkles size={11} className="text-yellow-400" />
                  {activeSlide.badge || "Badge Text"}
                </span>
                <span className="text-[10px] text-slate-400 font-mono ml-auto">Slide {activeSlideIndex + 1} Preview</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight leading-tight">
                {activeSlide.title || "Main Title"}{" "}
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-teal-300 bg-clip-text text-transparent">
                  {activeSlide.highlight || "Highlight Words"}
                </span>
              </h3>
              <p className="text-xs text-slate-300 mt-2 max-w-2xl line-clamp-2">
                {activeSlide.description || "Description preview goes here..."}
              </p>
            </div>

            {/* 1. Main Copy & Badge */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-2">
                <Sparkles size={13} className="text-blue-600" /> 1. Slide Titles & Copy
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Top Badge Text</label>
                  <input
                    type="text"
                    value={activeSlide.badge || ""}
                    onChange={(e) => updateActiveSlide((s) => ({ ...s, badge: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Modern Laundry Platform"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Main Heading (White/Dark Text)</label>
                  <input
                    type="text"
                    value={activeSlide.title || ""}
                    onChange={(e) => updateActiveSlide((s) => ({ ...s, title: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="e.g. Clean Clothes"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Highlight Heading (Gradient Text)</label>
                  <input
                    type="text"
                    value={activeSlide.highlight || ""}
                    onChange={(e) => updateActiveSlide((s) => ({ ...s, highlight: e.target.value }))}
                    className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold text-blue-600"
                    placeholder="e.g. Without the Hassle"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={activeSlide.description || ""}
                  onChange={(e) => updateActiveSlide((s) => ({ ...s, description: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none"
                  placeholder="Comprehensive description for this slide..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                  <ImageIcon size={13} className="text-slate-400" /> Slide Image URL / Path
                </label>
                <input
                  type="text"
                  value={activeSlide.image || ""}
                  onChange={(e) => updateActiveSlide((s) => ({ ...s, image: e.target.value }))}
                  className="w-full px-3.5 py-2 text-xs font-mono border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="e.g. /images/home/hero/hero-1.jpg or https://..."
                />
              </div>
            </div>

            {/* 2. CTA Buttons */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-2">
                <ExternalLink size={13} className="text-blue-600" /> 2. Call to Action Buttons
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary Button */}
                <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-xl space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-blue-700">Primary Button (Solid)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSlide.primaryBtn?.label || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => ({
                            ...s,
                            primaryBtn: { ...s.primaryBtn, label: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Book Pickup"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Link URL</label>
                      <input
                        type="text"
                        value={activeSlide.primaryBtn?.href || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => ({
                            ...s,
                            primaryBtn: { ...s.primaryBtn, href: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. /services"
                      />
                    </div>
                  </div>
                </div>

                {/* Secondary Button */}
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">Secondary Button (Outline)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Button Label</label>
                      <input
                        type="text"
                        value={activeSlide.secondaryBtn?.label || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => ({
                            ...s,
                            secondaryBtn: { ...s.secondaryBtn, label: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Explore Services"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-1">Link URL</label>
                      <input
                        type="text"
                        value={activeSlide.secondaryBtn?.href || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => ({
                            ...s,
                            secondaryBtn: { ...s.secondaryBtn, href: e.target.value },
                          }))
                        }
                        className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. /pricing"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Feature Badges (Bottom 4 Pills) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <CheckCircle2 size={13} className="text-blue-600" /> 3. Feature Pills (Bottom Grid)
                </h4>
                <button
                  onClick={() =>
                    updateActiveSlide((s) => ({
                      ...s,
                      features: [...(s.features || []), { title: "New Feature", icon: "CheckCircle" }],
                    }))
                  }
                  className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus size={13} /> Add Pill
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {(activeSlide.features || []).map((feat, fIdx) => (
                  <div key={fIdx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl relative group space-y-2">
                    <button
                      onClick={() =>
                        updateActiveSlide((s) => ({
                          ...s,
                          features: s.features.filter((_, idx) => idx !== fIdx),
                        }))
                      }
                      className="absolute top-2 right-2 text-slate-300 hover:text-red-500 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
                    </button>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Feature Title</label>
                      <input
                        type="text"
                        value={feat.title || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => {
                            const copy = [...s.features];
                            copy[fIdx] = { ...copy[fIdx], title: e.target.value };
                            return { ...s, features: copy };
                          })
                        }
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="e.g. Doorstep Pickup"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Icon (Lucide name)</label>
                      <input
                        type="text"
                        value={feat.icon || ""}
                        onChange={(e) =>
                          updateActiveSlide((s) => {
                            const copy = [...s.features];
                            copy[fIdx] = { ...copy[fIdx], icon: e.target.value };
                            return { ...s, features: copy };
                          })
                        }
                        className="w-full px-2.5 py-1 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono"
                        placeholder="e.g. Truck, Shield"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 4. Floating Metric Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b pb-2 flex items-center gap-2">
                <Layers size={13} className="text-blue-600" /> 4. Floating Badge Card (On Slide Image)
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Card Title</label>
                  <input
                    type="text"
                    value={activeSlide.floatingCard?.title || ""}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({
                        ...s,
                        floatingCard: { ...s.floatingCard, title: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Customer Rating"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Primary Value</label>
                  <input
                    type="text"
                    value={activeSlide.floatingCard?.value || ""}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({
                        ...s,
                        floatingCard: { ...s.floatingCard, value: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold"
                    placeholder="e.g. 4.9 or Live"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Subtitle / Extra Info</label>
                  <input
                    type="text"
                    value={activeSlide.floatingCard?.subtitle || ""}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({
                        ...s,
                        floatingCard: { ...s.floatingCard, subtitle: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. 12k+ Reviews"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Icon Name</label>
                  <input
                    type="text"
                    value={activeSlide.floatingCard?.icon || ""}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({
                        ...s,
                        floatingCard: { ...s.floatingCard, icon: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs font-mono border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. Star, QrCode"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Position on Image</label>
                  <select
                    value={activeSlide.floatingCard?.position || "bottom-right"}
                    onChange={(e) =>
                      updateActiveSlide((s) => ({
                        ...s,
                        floatingCard: {
                          ...s.floatingCard,
                          position: e.target.value as HeroSlideData["floatingCard"]["position"],
                        },
                      }))
                    }
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-right">Top Right</option>
                    <option value="top-left">Top Left</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
            </div>

          </div>
        ) : null}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            {slides.length} slide{slides.length !== 1 ? "s" : ""} configured for homepage hero slider
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={saveChanges}
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 text-xs font-black text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:opacity-95 shadow-md transition-all disabled:opacity-50"
            >
              {loading ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              {loading ? "Saving Slider..." : "Save Hero Slider"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
