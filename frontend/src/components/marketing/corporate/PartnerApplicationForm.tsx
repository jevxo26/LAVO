"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/store";
import { motion } from "framer-motion";
import { toast } from "sonner";

const PartnerApplicationForm = () => {
  const router = useRouter();

  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    targetCity: "",
    experience: "",
    reason: "",
  });


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error("Please login to submit a partner application.");
      router.push("/login");
      return;
    }

    try {
      const token = localStorage.getItem("laundrix_token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/partner-applications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok && data.success) {
        toast.success(
          data.message || "Partner application submitted successfully!"
        );

        // Form reset
        setFormData({
          fullName: "",
          email: "",
          phone: "",
          targetCity: "",
          experience: "",
          reason: "",
        });

        return;
      }

      // API returned an error
      toast.error(data.message || "Failed to submit partner application.");
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong. Please try again.");
    }
  };
  return (
    <div>
      {/* partner application */}
      <section className="pt-16 pb-8 md:pb-10 lg:pb-12 md:py-20 bg-surface-light">
        <div className="max-w-3xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1],
            }} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 md:p-10">

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
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name
                  </label>

                  <input
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
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
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
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
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+880 1700-123456"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Target City
                  </label>

                  <input
                    name="targetCity"
                    value={formData.targetCity}
                    onChange={handleChange}
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
                  name="experience"
                  value={formData.experience}
                  onChange={handleChange}
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
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
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
          </motion.div>
        </div>
      </section >
    </div >
  )
}

export default PartnerApplicationForm
