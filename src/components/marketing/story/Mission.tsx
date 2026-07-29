import Image from "next/image";

const Mission = () => {
    return (
        <div>
            <section className="py-20 bg-[#F8FAFC]">
                <div className="max-w-7xl mx-auto px-4 md:px-6">
                    <div className="grid lg:grid-cols-2 gap-10 items-center">

                        {/* Left */}
                        <div>
                            <h2 className="text-4xl font-bold text-slate-900 mb-6">
                                Our Mission
                            </h2>

                            <p className="text-slate-600 leading-8 mb-6">
                                LAUNDRIX was founded on a simple belief: professional-quality
                                laundry should be accessible to everyone, not just luxury hotels.
                                We set out to build the technology infrastructure that would make
                                that possible at scale.
                            </p>

                            <p className="text-slate-600 leading-8 mb-8">
                                Today, we process over 50,000 orders per month across 24
                                branches, serving everyone from Fortune 500 hotels to busy
                                parents — all with the same standard of care and transparency
                                you'd expect from the world's best service companies.
                            </p>

                            <div className="rounded-3xl border border-slate-200 bg-white p-8">

                                <div className="mb-8">
                                    <h3 className="text-xl font-semibold text-primary mb-3">
                                        Our Vision
                                    </h3>

                                    <p className="text-slate-600 leading-7">
                                        To become the default laundry infrastructure for every city in North America -
                                        a plateform where quality, convenience, and sustainability are never compromise.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="text-xl font-semibold text-primary mb-3">
                                        Our Mission
                                    </h3>

                                    <p className="text-slate-600 leading-7">
                                        Empower communities with accessible, eco-friendly laundry
                                        solutions that save time, reduce waste, and create a better
                                        customer experience.
                                    </p>
                                </div>

                            </div>
                        </div>

                        {/* Right */}
                        <div>
                            <div className="relative h-[520px] rounded-[32px] overflow-hidden">

                                <Image
                                    src="https://images.unsplash.com/photo-1517677208171-0bc6725a3e60"
                                    alt="Our Mission"
                                    fill
                                    className="object-cover"
                                />

                            </div>
                        </div>

                    </div>
                </div>
            </section>
        </div>
    )
}

export default Mission
