"use client";

import React, { useMemo } from "react";
import dynamic from "next/dynamic";
import { DEFAULT_HERO_SLIDES, HeroSlideData } from "@/components/dashboard/shared/HeroSectionEditor";
import { HeroSlideContent } from "./HeroSlideContent";

// Client-side only Swiper with static slide fallback during SSR loading
const HeroSwiper = dynamic(() => import("./HeroSwiper"), {
  ssr: false,
  loading: () => <HeroSlideContent slide={DEFAULT_HERO_SLIDES[0]} sIdx={0} />,
});

interface HomeHeroProps {
  data?: {
    id?: string | null;
    title?: string | null;
    subtitle?: string | null;
    content?: string | null;
    items?: any[] | null;
    [key: string]: any;
  } | null;
}

export function HomeHero({ data }: HomeHeroProps) {
  // Parse dynamic slides from CMS section.content or fallback to DEFAULT_HERO_SLIDES
  const heroSlides = useMemo<HeroSlideData[]>(() => {
    if (data?.content) {
      try {
        const parsed = JSON.parse(data.content);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
        if (parsed.slides && Array.isArray(parsed.slides) && parsed.slides.length > 0) {
          return parsed.slides;
        }
      } catch (err) {
        console.warn("Could not parse CMS hero content JSON:", err);
      }
    }
    return DEFAULT_HERO_SLIDES;
  }, [data?.content]);

  return (
    <section className="relative max-h-[70%] overflow-hidden bg-background">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-44 -right-44 h-[700px] w-[700px] rounded-full bg-primary/10 blur-[180px]" />
        <div className="absolute -bottom-44 -left-44 h-[700px] w-[700px] rounded-full bg-secondary/10 blur-[180px]" />
      </div>

      <HeroSwiper slides={heroSlides} />
    </section>
  );
}

export default HomeHero;