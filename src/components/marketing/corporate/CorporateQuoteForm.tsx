"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export function CorporateQuoteForm() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    company: "",
    email: "",
    phone: "",
    weeklyVolume: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    toast.success("Corporate inquiry submitted successfully! Our B2B team will contact you shortly.");
  };

  return (
    <div className="mt-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: 0.8,
          ease: [0.22, 1, 0.36, 1],
        }}
      >
        <div className="bg-white rounded-[32px] p-8 md:p-10 lg:p-12 border border-slate-100 shadow-xl shadow-slate-200/40">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request a Corporate Quote</h2>
          <p className="text-slate-500 text-sm mb-8">
            Tell us about your needs and we&apos;ll respond within 2 business hours.
          </p>

          {submitted ? (
            <div className="p-8 bg-blue-50/60 border border-blue-100 rounded-2xl text-center space-y-3">
              <CheckCircle2 size={40} className="text-blue-600 mx-auto" />
              <h3 className="text-lg font-bold text-slate-900">Thank You for Your Interest!</h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto">
                Your inquiry has been logged. A dedicated Laundrix account manager will reach out within 2 business hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="John Smith"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="Acme Corp"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="john@acme.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-900">Phone</label>
                  <input
                    type="tel"
                    required
                    placeholder="+880 1700-123458"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Weekly Volume</label>
                <input
                  type="text"
                  placeholder="e.g. 500 garments/week"
                  value={formData.weeklyVolume}
                  onChange={(e) => setFormData({ ...formData, weeklyVolume: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Message</label>
                <textarea
                  placeholder="Tell us about your laundry requirements..."
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-colors resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl py-4 flex items-center justify-center gap-2 transition-colors mt-4"
              >
                Submit Inquiry <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
