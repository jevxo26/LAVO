"use client";
import { CalendarDays } from "lucide-react";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const timeline = [
  {
    year: "2019",
    title: "Founded in Manhattan",
    description:
      "LAUNDRIX opens its first branch at 42 Commerce St with a team of 8.",
  },
  {
    year: "2020",
    title: "QR Tracking Launched",
    description:
      "Proprietary garment tracking becomes the industry's first garment-level QR platform.",
  },
  {
    year: "2021",
    title: "Brooklyn & Queens",
    description:
      "Platform grows to 8 locations and onboards first hotel enterprise clients.",
  },
  {
    year: "2022",
    title: "Series A — $12M",
    description:
      "$12M raised to accelerate multi-city expansion and technology development.",
  },
  {
    year: "2023",
    title: "Corporate Programme",
    description:
      "Dedicated corporate tier launched, serving 50+ enterprise clients from day one.",
  },
  {
    year: "2024",
    title: "24 Branches • 8 Cities",
    description:
      "LAUNDRIX reaches current scale with 50K+ monthly orders and 200+ partners.",
  },
];



// const timeline = [
//   {
//     year: "2019",
//     title: "Founded in Manhattan",
//     description:
//       "LAUNDRIX opens its first branch at 42 Commerce St with a team of 8.",
//   },
//   {
//     year: "2020",
//     title: "QR Tracking Launched",
//     description:
//       "Proprietary garment tracking becomes the industry's first garment-level QR platform.",
//   },
//   {
//     year: "2021",
//     title: "Brooklyn & Queens",
//     description:
//       "Platform grows to 8 locations and onboards first hotel enterprise clients.",
//   },
//   {
//     year: "2022",
//     title: "Series A — $12M",
//     description:
//       "$12M raised to accelerate multi-city expansion and technology development.",
//   },
//   {
//     year: "2023",
//     title: "Corporate Programme",
//     description:
//       "Dedicated corporate tier launched, serving 50+ enterprise clients from day one.",
//   },
//   {
//     year: "2024",
//     title: "24 Branches • 8 Cities",
//     description:
//       "LAUNDRIX reaches current scale with 50K+ monthly orders and 200+ partners.",
//   },
// ];

const Journey = () => {
  const sectionRef = useRef<HTMLElement | null>(null);
  const lineRef = useRef<HTMLDivElement | null>(null);
  const itemsRef = useRef<(HTMLDivElement | null)[]>([]);
  const yearsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      /* -----------------------------
         Initial States
      ----------------------------- */

      gsap.set(lineRef.current, {
        scaleY: 0,
        transformOrigin: "top center",
      });

      gsap.set(itemsRef.current, {
        opacity: 0,
        x: -40,
      });

      gsap.set(yearsRef.current, {
        opacity: 0,
        scale: 0.5,
      });

      /* -----------------------------
         Main Timeline Animation
      ----------------------------- */

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          end: "bottom 65%",
          toggleActions: "play none none reverse",
        },
      });

      /* Vertical Line */
      tl.to(
        lineRef.current,
        {
          scaleY: 1,
          duration: 1.8,
          ease: "power2.out",
        },
        0
      );

      /* Timeline Items */
      tl.to(
        itemsRef.current,
        {
          opacity: 1,
          x: 0,
          duration: 0.7,
          stagger: 0.25,
          ease: "power3.out",
        },
        0.15
      );

      /* Year Circles */
      tl.to(
        yearsRef.current,
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.25,
          ease: "back.out(1.7)",
        },
        0.15
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden py-20 sm:py-24 lg:py-28"
    >
      {/* Header */}
      <div className="mb-16 text-center">
        <h2 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Our Journey
        </h2>

        <p className="mx-auto mt-4 max-w-xl text-slate-500">
          From a single branch to a smarter laundry network.
        </p>
      </div>

      {/* Timeline */}
      <div className="mx-auto max-w-3xl px-4">
        <div className="relative">

          {/* Vertical Line */}
          <div
            ref={lineRef}
            className="
              absolute
              left-7
              top-0
              h-full
              w-[2px]
              bg-gradient-to-b
              from-primary
              via-blue-200
              to-secondary
            "
          />

          <div className="space-y-10">
            {timeline.map((item, index) => (
              <div
                key={item.year}
                ref={(el) => {
                  itemsRef.current[index] = el;
                }}
                className="relative flex items-start gap-6"
              >
                {/* Year */}
                <div
                  ref={(el) => {
                    yearsRef.current[index] = el;
                  }}
                  className="
                    relative
                    z-10
                    flex
                    h-14
                    w-14
                    shrink-0
                    items-center
                    justify-center
                    rounded-2xl
                    bg-primary
                    text-sm
                    font-bold
                    text-white
                    shadow-lg
                    shadow-primary/20
                  "
                >
                  {item.year}
                </div>

                {/* Content */}
                <div className="pt-1">
                  <h3 className="mb-1 text-xl font-bold text-slate-900">
                    {item.title}
                  </h3>

                  <p className="leading-relaxed text-slate-500">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Journey;