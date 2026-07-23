import { CalendarDays } from "lucide-react";

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

const Journey = () => {
    return (
        <section className="py-20 bg-slate-50">
            <div className="max-w-5xl mx-auto px-4">

                <div className="text-center mb-16">

                    <h2 className="text-4xl font-bold text-slate-900">
                        Our Journey
                    </h2>
                </div>

                <div className="max-w-3xl mx-auto">
                    <div className="relative">

                        {/* Vertical Line */}
                        <div className="absolute left-7 top-0 h-full w-[2px] bg-blue-100" />

                        <div className="space-y-10">
                            {timeline.map((item) => (
                                <div
                                    key={item.year}
                                    className="relative flex items-start gap-6"
                                >
                                    {/* Year */}
                                    <div className="relative z-10 w-14 h-14 rounded-2xl bg-primary text-white shadow-lg flex items-center justify-center font-bold text-sm">
                                        {item.year}
                                    </div>

                                    {/* Content */}
                                    <div className="pt-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1">
                                            {item.title}
                                        </h3>

                                        <p className="text-slate-500 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </section>
    )
}

export default Journey
