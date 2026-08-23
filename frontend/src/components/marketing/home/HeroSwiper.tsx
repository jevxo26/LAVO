"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination } from "swiper/modules";
import { HeroSlideData } from "@/components/dashboard/shared/HeroSectionEditor";
import { HeroSlideContent } from "./HeroSlideContent";

interface HeroSwiperProps {
  slides: HeroSlideData[];
}

export function HeroSwiper({ slides }: HeroSwiperProps) {
  return (
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
      {slides.map((slide, sIdx) => (
        <SwiperSlide key={slide.id || sIdx}>
          <HeroSlideContent slide={slide} sIdx={sIdx} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

export default HeroSwiper;
