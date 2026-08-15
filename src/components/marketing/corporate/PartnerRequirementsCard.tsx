"use client";

import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";

const PartnerRequirementsCard = () => {
    const leftRequirements = [
        "Minimum investment capacity of $80,000",
        "Clean background check",
        "Basic equipment: industrial washers/dryers (or lease through us)",
    ];

    const rightRequirements = [
        "Suitable commercial premises (500+ sq ft)",
        "Strong commitment to customer service excellence",
        "1+ year of business or management experience",
    ];
    return (
        <div>
            {/* partner requirement */}
            <section className="py-12 md:py-16 lg:py-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                    }}
                    className="max-w-[1380px] mx-auto px-4 md:px-6"
                >
                    <div className="rounded-3xl bg-white border p-8 ">
                        <h2 className="text-3xl font-bold">
                            Partner Requirements
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
                            <div className="space-y-5">
                                {leftRequirements.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                        <p className="text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-5">
                                {rightRequirements.map((item, index) => (
                                    <div key={index} className="flex items-start gap-3">
                                        <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                                        <p className="text-slate-700">{item}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>
        </div>
    )
}

export default PartnerRequirementsCard
