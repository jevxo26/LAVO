"use client";

import React from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Fatima Khan",
    role: "Working Professional",
    content:
      "LAUNDRIX saved me so much time! The QR tracking is amazing and my clothes are always returned in perfect condition.",
    rating: 5,
    avatar: "👩‍💼",
  },
  {
    name: "Ahmed Hassan",
    role: "Business Owner",
    content:
      "Reliable, professional, and affordable. I use LAUNDRIX for all my work shirts. Highly recommended!",
    rating: 5,
    avatar: "👨‍💼",
  },
  {
    name: "Priya Sharma",
    role: "Homemaker",
    content:
      "The pickup service is so convenient. No more trips to the laundromat. Best service in Dhaka!",
    rating: 5,
    avatar: "👩",
  },
  {
    name: "Mohammad Amin",
    role: "IT Professional",
    content:
      "The mobile app is intuitive and the real-time tracking gives me peace of mind. Outstanding service!",
    rating: 5,
    avatar: "👨‍💻",
  },
  {
    name: "Nadia Rahman",
    role: "Student",
    content:
      "As a student, the flexible scheduling and quick turnaround time is perfect for my needs.",
    rating: 5,
    avatar: "👩‍🎓",
  },
  {
    name: "Karim Abdul",
    role: "Hotel Manager",
    content:
      "We use LAUNDRIX for our hotel linens. Consistent quality and reliable delivery every time.",
    rating: 5,
    avatar: "👨",
  },
];

export function Testimonials() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-300/10 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            What Our Customers Say
          </h2>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust LAUNDRIX
          </p>
        </motion.div>

        {/* Testimonials grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.05 }}
              className="group relative"
            >
              {/* Card */}
              <div className="relative bg-white/60 backdrop-blur-sm border border-white/50 rounded-2xl p-8 hover:border-blue-200 hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                {/* Header with avatar and stars */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonial.avatar}</div>
                    <div>
                      <h3 className="font-bold text-slate-900">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm text-slate-500">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quote */}
                <p className="text-slate-700 mb-6 flex-grow italic">
                  "{testimonial.content}"
                </p>

                {/* Rating */}
                <div className="flex gap-1">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className="fill-yellow-400 text-yellow-400"
                    />
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
