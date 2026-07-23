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
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="rounded-3xl bg-white border p-8">
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
                </div>
            </section>
        </div>
    )
}

export default PartnerRequirementsCard
