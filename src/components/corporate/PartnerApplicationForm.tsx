import {ArrowRight} from "lucide-react";

const PartnerApplicationForm = () => {
  return (
    <div>
      {/* partner application */}
      <section className="py-16 md:py-20 bg-surface-light">
        <div className="max-w-3xl mx-auto px-4">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10">

            {/* Heading */}
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-slate-900">
                Partner Application
              </h2>

              <p className="text-slate-500 mt-2">
                Our partnership team will contact you within 48 hours.
              </p>
            </div>

            {/* Form */}
            <form className="space-y-6">

              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    placeholder="John Smith"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    placeholder="john@example.com"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone
                  </label>

                  <input
                    type="text"
                    placeholder="+880 1700-123456"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Target City
                  </label>

                  <input
                    type="text"
                    placeholder="Dhaka"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Experience */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Relevant Experience
                </label>

                <input
                  type="text"
                  placeholder="Laundry business, retail management, operations..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Why */}
              <div>
                <label className="block text-sm font-semibold mb-2">
                  Why LAUNDRIX?
                </label>

                <textarea
                  rows={5}
                  placeholder="Tell us why you want to become a LAUNDRIX partner..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              {/* Button */}
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                Submit Application
                <ArrowRight size={18} />
              </button>

            </form>

          </div>
        </div>
      </section>
    </div>
  )
}

export default PartnerApplicationForm
