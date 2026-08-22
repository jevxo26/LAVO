"use client";

import { motion } from "framer-motion";
import PricingCard from "../pricing/PricingCard";
import { HomeBranches } from "./HomeBranches";

const pricing = [
  {
    id: "shirt",
    title: "Shirt",
    price: "From ৳50",
    time: "24 hrs est. delivery",
    imageUrl: "/images/home/service/servie1.png",
  },
  {
    id: "t_shirt",
    title: "T-Shirt",
    price: "From ৳40",
    time: "24 hrs est. delivery",
    imageUrl: "/images/home/price/p-1.jpg",
  },
  {
    id: "jeans",
    title: "Jeans",
    price: "From ৳80",
    time: "36 hrs est. delivery",
    imageUrl: "/images/home/price/p-2.jpg",
  },
  {
    id: "blazer",
    title: "Blazer",
    price: "From ৳150",
    time: "48 hrs est. delivery",
    imageUrl: "/images/home/price/p-3.jpg",
  },
  {
    id: "wash&fold",
    title: "Wash & Fold",
    price: "From ৳70",
    time: "36 hrs est. delivery",
    imageUrl: "/images/home/service/servie4.png",
  },
  {
    id: "bedshet",
    title: "Bedsheet",
    price: "From ৳120",
    time: "48 hrs est. delivery",
    imageUrl: "/images/home/price/p-4.jpg",
  },
  {
    id: "panjabi",
    title: "Panjabi/Kurta",
    price: "From ৳120",
    time: "48 hrs est. delivery",
    imageUrl: "/images/home/price/p-5.png",
  },
  {
    id: "silk_saree",
    title: "Silk Saree",
    price: "From ৳350",
    time: "72 hrs est. delivery",
    imageUrl: "/images/home/price/p-6.png",
  },
];

const pricingBranchData = {
  title: "Available Pickup Branches",
  items: [
    {
      name: "Cumilla Branch",
      address: "Kandirpar, Cumilla",
      time: "Daily 8am-9pm",
    },
    {
      name: "Dhaka Branch",
      address: "Dhanmondi, Dhaka",
      time: "Daily 7am-10pm",
    },
    {
      name: "Chattogram Branch",
      address: "GEC Circle",
      time: "Daily 8am-9pm",
    },
    {
      name: "Sylhet Branch",
      address: "Zindabazar",
      time: "Daily 8am-8pm",
    },
  ],
};

const HomePricing = ({ data }: { data?: any })=> {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const title = data?.title || "Honest Prices in Bangladeshi Taka";
  const subtitle = data?.subtitle || "No subscriptions. No hidden charges. Pay only for what you clean.";
  // const Icon = icon;
  return (
    <section className="w-full py-12 md:py-16 lg:py-20 my-0 bg-white">
      <div className="max-w-7xl mx-auto px-4 md:px-6">

        {/* Section Header */}
        <div className="relative mb-12">

          {/* Center Content */}
          <div className="max-w-2xl mx-auto text-center">
            <span className="text-blue-500 px-3 py-1 mb-4 rounded-full bg-blue-50 font-bold tracking-widest text-xs uppercase inline-flex items-center">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
              Pricing
            </span>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 mb-4">
              {title}
            </h2>

            <p className="text-slate-500 text-sm">
              {subtitle}
            </p>
          </div>

        </div>

        {/* prices Grid */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-8"
        >
          {pricing.slice(0, 8).map((price) => (
            <motion.div key={price.id} variants={item}>
              <PricingCard {...price} />
            </motion.div>
          ))}
        </motion.div>
          <HomeBranches data={pricingBranchData} />
      </div>
    </section>
  );
}

export default HomePricing