'use client'

import Image from "next/image";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const blogs = [
  {
    category: "Care Tips",
    readTime: "5 min read",
    title: "The Complete Guide to Fabric Care in 2025",
    description:
      "Everything you need to know about washing, drying and storing your most valuable garments.",
    author: "LAUNDRIX Editorial",
    date: "Jan 12, 2025",
    image:
      "/images/routes/insight/insight1.jpg",
  },
  {
    category: "Technology",
    readTime: "4 min read",
    title: "How QR Tagging is Revolutionising Laundry Logistics",
    description:
      "An inside look at how we track every single garment from pickup to delivery using QR technology.",
    author: "Tech Team",
    date: "Dec 28, 2024",
    image:
      "/images/routes/insight/insight2.jpg",
  },
  {
    category: "Industry",
    readTime: "6 min read",
    title: "Why 5-Star Hotels Trust Professional Laundry Partners",
    description:
      "Volume, consistency, and discretion — the three pillars that define hotel-grade laundry operations.",
    author: "Business Team",
    date: "Dec 15, 2024",
    image:
      "/images/routes/insight/insight3.jpg",
  },
];

const filters = ["All", "Care Tips", "Technology", "Industry"];

export default function BlogSection() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = [
    "All",
    ...Array.from(new Set(blogs.map((blog) => blog.category))),
  ];

  const filteredBlogs = blogs.filter((blog) => {
    const matchesCategory =
      activeCategory === "All" || blog.category === activeCategory;

    const search = searchTerm.toLowerCase();

    const matchesSearch =
      blog.title.toLowerCase().includes(search) ||
      blog.description.toLowerCase().includes(search) ||
      blog.category.toLowerCase().includes(search) ||
      blog.author.toLowerCase().includes(search);

    return matchesCategory && matchesSearch;
  });

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-[1380px] mx-auto px-4 md:px-6">

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-5 justify-between mb-10">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search articles..."
              className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-12 pr-5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-5 h-12 rounded-2xl border transition ${activeCategory === category
                  ? "bg-primary text-white border-primary"
                  : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                  }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
        {/* Cards */}
          {filteredBlogs.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
              {filteredBlogs.map((blog, index) => (
                <motion.article
                  key={blog.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: 0.9,
                    delay: index * 0.12,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 hover:shadow-lg transition"
                >
                  <div className="relative h-60">
                    <Image
                      src={blog.image}
                      alt={blog.title}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-3 text-xs mb-4">
                      <span className="px-3 py-1 rounded-full bg-blue-50 text-primary font-medium">
                        {blog.category}
                      </span>

                      <span className="text-slate-400">
                        {blog.readTime}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 leading-snug mb-3">
                      {blog.title}
                    </h3>

                    <p className="text-slate-500 leading-relaxed mb-6">
                      {blog.description}
                    </p>

                    <div className="flex justify-between items-center text-sm text-slate-400">
                      <span>{blog.author}</span>
                      <span>{blog.date}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-20 text-center"
            >
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <Search className="h-7 w-7 text-primary" />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-slate-900">
                No articles found
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                We couldn't find any articles matching your search.
              </p>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("All");
                }}
                className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
              >
                Clear Filters
              </button>
            </motion.div>
          )}
      </div>
    </section>
  );
}