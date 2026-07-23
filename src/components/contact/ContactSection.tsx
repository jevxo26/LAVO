"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import {
    Phone,
    Mail,
    MapPin,
    Clock,
    ArrowRight,
} from "lucide-react";

const ContactMap = dynamic(
  () => import("@/components/contact/ContactMap"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full bg-slate-100 animate-pulse flex items-center justify-center">
        Loading map...
      </div>
    ),
  }
);

const contacts = [
    {
        icon: Phone,
        title: "Phone",
        value: "+1 (555) 100-0000",
        subtitle: "Mon–Fri 8am–8pm",
    },
    {
        icon: Mail,
        title: "Email",
        value: "hello@laundrix.com",
        subtitle: "Response within 2 hours",
    },
    {
        icon: MapPin,
        title: "Headquarters",
        value: "42 Commerce St",
        subtitle: "New York, NY 10007",
    },
    {
        icon: Clock,
        title: "Support Hours",
        value: "Mon–Sat 7am–9pm",
        subtitle: "Sunday 9am–6pm",
    },
];

export default function ContactSection() {
    const [showMap, setShowMap] = useState(false);

    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 md:px-6">

                <div className="grid lg:grid-cols-2 gap-10 items-start">

                    {/* Left */}
                    <div className="bg-white rounded-3xl border border-slate-200 p-8">

                        <h2 className="text-4xl font-bold text-slate-900 mb-8">
                            Send a Message
                        </h2>

                        <form className="space-y-6">

                            <div className="grid sm:grid-cols-2 gap-5">

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Full Name
                                    </label>

                                    <input
                                        type="text"
                                        placeholder="John Smith"
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold mb-2">
                                        Email
                                    </label>

                                    <input
                                        type="email"
                                        placeholder="john@email.com"
                                        className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-primary"
                                    />
                                </div>

                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Subject
                                </label>

                                <input
                                    type="text"
                                    className="w-full h-12 rounded-xl border border-slate-200 px-4 outline-none focus:border-primary"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold mb-2">
                                    Message
                                </label>

                                <textarea
                                    rows={5}
                                    placeholder="How can we help you?"
                                    className="w-full rounded-xl border border-slate-200 px-4 py-3 resize-none outline-none focus:border-primary"
                                />
                            </div>

                            <button className="w-full h-12 rounded-xl bg-primary text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition">
                                Send Message
                                <ArrowRight size={18} />
                            </button>

                        </form>
                    </div>

                    {/* Right */}
                    <div className="space-y-5">

                        {contacts.map((item) => {
                            const Icon = item.icon;

                            return (
                                <div
                                    key={item.title}
                                    className="bg-white rounded-2xl border border-slate-200 p-5 flex gap-4"
                                >
                                    <div className="w-12 h-12 rounded-full bg-blue-50 text-primary flex items-center justify-center shrink-0">
                                        <Icon size={20} />
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-900">
                                            {item.title}
                                        </h4>

                                        <p className="text-slate-700">
                                            {item.value}
                                        </p>

                                        <p className="text-sm text-slate-400">
                                            {item.subtitle}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Map */}
                        <div className="overflow-hidden rounded-2xl border border-slate-200 h-64 relative bg-slate-100">

                            {showMap ? (
                                <ContactMap />
                            ) : (
                                <>
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage:
                                                "url('https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80')",
                                        }}
                                    />

                                    <div className="absolute inset-0 bg-black/20" />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <button
                                            onClick={() => setShowMap(true)}
                                            className="bg-white hover:bg-slate-50 transition px-5 py-3 rounded-full shadow-lg flex items-center gap-2 font-semibold"
                                        >
                                            <MapPin className="text-primary" size={18} />
                                            View LAUNDRIX HQ
                                        </button>
                                    </div>
                                </>
                            )}

                        </div>

                    </div>

                </div>

            </div>
        </section>
    );
}