import Image from "next/image";
import { Search } from "lucide-react";

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
      "https://images.unsplash.com/photo-1512436991641-6745cdb1723f?w=900&q=80",
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
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=900&q=80",
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
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=900&q=80",
  },
];

const filters = ["All", "Care Tips", "Technology", "Industry"];

export default function BlogSection() {
  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-5 justify-between mb-10">

          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search articles..."
              className="w-full h-12 rounded-2xl border border-slate-200 bg-white pl-12 pr-5 text-sm outline-none focus:border-primary"
            />
          </div>

          <div className="flex gap-3 flex-wrap">
            {filters.map((item, index) => (
              <button
                key={item}
                className={`px-5 h-12 rounded-2xl border transition ${
                  index === 0
                    ? "bg-primary text-white border-primary"
                    : "bg-white border-slate-200 text-slate-600 hover:border-primary hover:text-primary"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
          {blogs.map((blog) => (
            <article
              key={blog.title}
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
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}