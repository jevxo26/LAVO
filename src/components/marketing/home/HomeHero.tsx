"use client";

import { ArrowRight, QrCode, Shield, Truck, CheckCircle, MapPin, Sparkles, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { Autoplay, Pagination, Navigation } from "swiper/modules";


const HomeHero = ({ data }: { data?: any }) => {
  const heroSlides = [
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
        {
          title: "Doorstep Pickup",
          icon: Truck,
        },
        {
          title: "Premium Care",
          icon: Shield,
        },
        {
          title: "Easy Booking",
          icon: CheckCircle,
        },
        {
          title: "Nearby Branches",
          icon: MapPin,
        },
      ],
      floatingCard: {
        icon: Star,
        title: "Customer Rating",
        value: "4.9",
        subtitle: "12k+ Reviews",
        position: "bottom-right",
      }
      
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
        {
          title: "Real-time Status",
          icon: QrCode,
        },
        {
          title: "Secure Process",
          icon: Shield,
        },
        {
          title: "Fast Delivery",
          icon: Truck,
        },
        {
          title: "Live Updates",
          icon: MapPin,
        },
      ],
      floatingCard: {
        icon: QrCode,
        title: "QR Tracking",
        value: "Live",
        position: "top-right",
      }
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
        href: "/book",
      },

      secondaryBtn: {
        label: "Explore Services",
        href: "/services",
      },

      features: [
        {
          title: "QR Tracking",
          icon: QrCode,
        },
        {
          title: "Secure Payment",
          icon: Shield,
        },
        {
          title: "Pickup & Delivery",
          icon: Truck,
        },
        {
          title: "Verified Quality",
          icon: CheckCircle,
        },
      ],

      floatingCard: {
        icon: Truck,
        title: "Pickup",
        value: "Scheduled",
        position: "top-left",
      }
    },

  ];
  return (
    <>
      <section className="relative overflow-hidden bg-background">
        {/* Background */}
        <div className="absolute inset-0 overflow-hidden">
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
          {heroSlides.map((slide) => {
            const FloatingIcon = slide.floatingCard.icon;
            return (
              <SwiperSlide key={slide.id}>
                <div className="container relative mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">

                  <div
                    className="
                      grid
                      py-10
                      items-center

                      gap-10
                      lg:gap-10
                      xl:gap-12

                      grid-cols-1

                      lg:grid-cols-[1fr_1fr]
                      xl:grid-cols-[1fr_1.05fr]
                    "
                  >

                    {/* LEFT */}
                    <motion.div
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.7 }}
                      className="w-full max-w-xl xl:max-w-2xl"
                    >
                      {/* Badge */}
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-card px-5 py-2 shadow-sm">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-muted-foreground">
                          {slide.badge}
                        </span>
                      </div>

                      {/* Heading */}
                      <h1 className="mt-6 text-4xl
                      sm:text-5xl
                      md:text-5xl
                      lg:text-6xl
                      xl:text-7xl
                      leading-tight 
                      font-black leading-[1] tracking-tight text-foreground">
                        {slide.title}
                        <br />
                        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                          {slide.highlight}
                        </span>
                      </h1>

                      {/* Description */}
                      <p className="mt-7 w-full max-w-lg text-base md:text-lg leading-8 text-muted-foreground">
                        {slide.description}
                      </p>

                      {/* Buttons */}
                      <div className="mt-10 flex flex-col
                      sm:flex-row
                      gap-4">
                        <Link
                          href={slide.primaryBtn.href}
                          className="group inline-flex items-center gap-2 rounded-xl bg-primary px-7 py-4 font-semibold text-primary-foreground shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                          {slide.primaryBtn.label}

                          <ArrowRight
                            size={18}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </Link>

                        <Link
                          href={slide.secondaryBtn.href}
                          className="inline-flex items-center rounded-xl border border-border bg-card px-7 py-4 font-semibold text-foreground transition-all duration-300 hover:border-primary hover:bg-muted"
                        >
                          {slide.secondaryBtn.label}
                        </Link>
                      </div>


                    </motion.div>

                    {/* RIGHT SIDE */}
                    <motion.div
                      initial={{ opacity: 0, x: 60 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8 }}
                      className="relative
                          hidden
                          md:flex
                          items-center
                          justify-center
                          pt-6"
                    >
                      {/* Background Glow */}
                      <div className="absolute h-[650px] w-[650px] rounded-full bg-primary/10 blur-[120px]" />

                      {/* Main Image */}
                      <div className="relative z-10 w-full
                      max-w-md
                      lg:max-w-xl
                      xl:max-w-[820px]">
                        <div className="relative overflow-hidden rounded-[28px] shadow-2xl">
                          <div className="relative aspect-[4/3] w-full">
                            <Image
                              src={slide.image}
                              alt={slide.title}
                              fill
                              priority
                              className="object-cover"
                            />
                          </div>
                        </div>
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className={`
                                absolute rounded-2xl border border-border bg-card px-5 py-4 shadow-xl
                                ${slide.floatingCard.position === "top-left"
                              ? "top-10 lg:-left-6 xl:-left-10"
                              : ""
                            }
                                ${slide.floatingCard.position === "top-right"
                              ? "top-10 lg:-right-6 xl:-right-10"
                              : ""
                            }
                                ${slide.floatingCard.position === "bottom-left"
                              ? "bottom-10 lg:-left-6 xl:-left-10"
                              : ""
                            }
                                ${slide.floatingCard.position === "bottom-right"
                              ? "bottom-10 lg:-right-6 xl:-right-10"
                              : ""
                            }
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

                              {"subtitle" in slide.floatingCard && (
                                <p className="text-xs text-success">
                                  {slide.floatingCard.subtitle}
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>

                        {/* Pickup */}
                        {/* <motion.div
                          animate={{ y: [0, -10, 0] }}
                          transition={{ repeat: Infinity, duration: 4 }}
                          className="absolute lg:-left-6 xl:-left-10 top-10 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                              <Truck className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">Pickup</p>
                              <h4 className="text-sm font-semibold text-foreground">
                                Scheduled
                              </h4>
                            </div>
                          </div>
                        </motion.div> */}

                        {/* QR Tracking */}
                        {/* <motion.div
                          animate={{ y: [0, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 5 }}
                          className="absolute lg:-right-6 xl:-right-10 top-10 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                              <QrCode className="h-5 w-5 text-primary" />
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">QR Tracking</p>
                              <h4 className="text-sm font-semibold text-foreground">
                                Live
                              </h4>
                            </div>
                          </div>
                        </motion.div> */}

                        {/* Status */}
                        {/* <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{ repeat: Infinity, duration: 3.5 }}
                          className="absolute lg:-left-6 xl:-left-10 bottom-10 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-success/10">
                              <CheckCircle className="h-5 w-5 text-success" />
                            </div>

                            <div>
                              <p className="text-xs text-muted-foreground">Order Status</p>
                              <h4 className="text-sm font-semibold text-foreground">
                                Ready
                              </h4>
                            </div>
                          </div>
                        </motion.div> */}

                        {/* Rating */}
                        {/* <motion.div
                          animate={{ y: [0, 8, 0] }}
                          transition={{ repeat: Infinity, duration: 4.5 }}
                          className="absolute lg:-right-6 xl:-right-10 bottom-10 rounded-2xl border border-border bg-card px-5 py-4 shadow-xl"
                        >
                          <p className="text-xs text-muted-foreground">
                            Customer Rating
                          </p>

                          <div className="mt-2 flex items-center gap-2">
                            <Star className="h-5 w-5 fill-warning text-warning" />

                            <span className="text-2xl font-bold text-foreground">
                              4.9
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-success">
                            Based on 12k+ Reviews
                          </p>
                        </motion.div> */}
                      </div>
                    </motion.div>
                  </div>
                  {/* Features */}
                  <div className="mt-10 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">                      {slide.features.map((feature) => {
                    const Icon = feature.icon;

                    return (
                      <div
                        key={feature.title}
                        className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg"
                      >
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>

                        <div>
                          <h4 className="font-semibold text-foreground">
                            {feature.title}
                          </h4>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              </SwiperSlide>
            )
          })}
        </Swiper>

      </section>
    </>
  )
}

export default HomeHero;
