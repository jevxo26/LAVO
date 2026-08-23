"use client";

import React, { useMemo } from "react";
import {
  ArrowRight,
  QrCode,
  Shield,
  Truck,
  CheckCircle,
  MapPin,
  Sparkles,
  Star,
  Zap,
  Award,
  Clock,
  Heart,
  Building,
  Store,
  User,
  Phone,
  Mail,
  Package,
  LucideIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { DEFAULT_HERO_SLIDES, HeroSlideData } from "@/components/dashboard/shared/HeroSectionEditor";

// ─── Dynamic Icon Resolver ───────────────────────────────────────────────────

const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  Shield,
  CheckCircle,
  MapPin,
  Sparkles,
  Star,
  QrCode,
  Zap,
  Award,
  Clock,
  Heart,
  Building,
  Store,
  User,
  Phone,
  Mail,
  Package,
};

function getIcon(name?: string, fallback: LucideIcon = Sparkles): LucideIcon {
  if (!name) return fallback;
  const key = Object.keys(ICON_MAP).find(
    (k) => k.toLowerCase() === name.trim().toLowerCase()
  );
  return key ? ICON_MAP[key] : fallback;
}

// ─── HomeHero Component ───────────────────────────────────────────────────────

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

      <Swiper
        modules={[Autoplay, Pagination]}
        slidesPerView={1}
        loop
        speed={900}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        className="hero-swiper"
      >
        {heroSlides.map((slide, sIdx) => {
          const FloatingIcon = getIcon(slide.floatingCard?.icon, Star);
          const pos = slide.floatingCard?.position || "bottom-right";

          return (
            <SwiperSlide key={slide.id || sIdx}>
              <div className="container relative mx-auto max-w-[1380px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
                <div
                  className="
                    grid
                    items-center
                    gap-10
                    lg:gap-10
                    xl:gap-12
                    grid-cols-1
                    lg:grid-cols-[1fr_1fr]
                    xl:grid-cols-[1fr_1.05fr]
                  "
                >
                  {/* LEFT COLUMN */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.7 }}
                    className="w-full space-y-3 max-w-xl xl:max-w-2xl"
                  >
                    {/* Badge */}
                    {slide.badge && (
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-5 py-2 shadow-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {slide.badge}
                        </span>
                      </div>
                    )}

                    {/* Heading */}
                    <h1
                      className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight font-black leading-[1] tracking-tight text-foreground"
                    >
                      {slide.title}
                      {slide.highlight && (
                        <>
                          <br />
                          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            {slide.highlight}
                          </span>
                        </>
                      )}
                    </h1>

                    {/* Description */}
                    {slide.description && (
                      <p className="w-full max-w-lg text-base md:text-lg leading-8 text-muted-foreground">
                        {slide.description}
                      </p>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-2">
                      {slide.primaryBtn?.label && (
                        <Link
                          href={slide.primaryBtn.href || "/services"}
                          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                          {slide.primaryBtn.label}
                          <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>
                      )}

                      {slide.secondaryBtn?.label && (
                        <Link
                          href={slide.secondaryBtn.href || "/pricing"}
                          className="inline-flex items-center rounded-xl border border-border bg-card px-5 py-3 font-semibold text-foreground transition-all duration-300 hover:border-primary hover:bg-muted"
                        >
                          {slide.secondaryBtn.label}
                        </Link>
                      )}
                    </div>
                  </motion.div>

                  {/* RIGHT COLUMN */}
                  <motion.div
                    initial={{ opacity: 0, x: 60 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative hidden md:flex items-center justify-center pt-4"
                  >
                    {/* Background Glow */}
                    <div className="absolute h-[650px] w-[650px] rounded-full bg-primary/10 blur-[120px]" />

                    {/* Main Image */}
                    <div className="relative z-10 w-full max-w-md lg:max-w-lg xl:max-w-[680px]">
                      <div className="relative overflow-hidden rounded-[28px] shadow-2xl">
                        <div className="relative aspect-[14/8] w-full">
                          <Image
                            src={slide.image || "/images/home/hero/hero-1.jpg"}
                            alt={slide.title || "Hero"}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 680px"
                            priority={sIdx === 0}
                            className="object-cover"
                          />
                        </div>
                      </div>

                      {/* Floating Card */}
                      {slide.floatingCard?.title && (
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className={`
                            absolute rounded-2xl border border-border bg-card px-5 py-4 shadow-xl z-20
                            ${pos === "top-left" ? "top-10 lg:-left-6 xl:-left-10" : ""}
                            ${pos === "top-right" ? "top-10 lg:-right-4 xl:-right-6" : ""}
                            ${pos === "bottom-left" ? "bottom-10 lg:-left-6 xl:-left-10" : ""}
                            ${pos === "bottom-right" ? "bottom-10 lg:-right-4 xl:-right-6" : ""}
                          `}
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                              <FloatingIcon className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">
                                {slide.floatingCard.title}
                              </p>
                              <h4 className="text-sm font-semibold text-foreground">
                                {slide.floatingCard.value}
                              </h4>
                              {slide.floatingCard.subtitle && (
                                <p className="text-xs text-success">
                                  {slide.floatingCard.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>
                </div>

                {/* Features Row */}
                {slide.features && slide.features.length > 0 && (
                  <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                    {slide.features.map((feature, index) => {
                      const Icon = getIcon(feature.icon, CheckCircle);

                      return (
                        <motion.div
                          key={feature.title + index}
                          initial={{ opacity: 0, y: 25 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3 + index * 0.1,
                            ease: [0.22, 1, 0.36, 1],
                          }}
                          whileHover={{ y: -5 }}
                          className="
                            flex items-center gap-3
                            rounded-xl
                            border border-border
                            bg-card
                            p-2.5
                            transition-all duration-300
                            hover:border-primary/30
                            hover:shadow-lg
                          "
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                            <Icon className="h-5 w-5 text-primary" />
                          </div>

                          <div>
                            <h4 className="font-semibold text-foreground text-xs sm:text-sm">
                              {feature.title}
                            </h4>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </section>
  );
}

export default HomeHero;