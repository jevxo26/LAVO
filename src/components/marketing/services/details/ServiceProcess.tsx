// "use client";

// import { motion } from "framer-motion";

// interface ProcessStep {
//   step: number;
//   title: string;
//   description: string;
// }

// interface ServiceProcessProps {
//   process: ProcessStep[];
// }

// export function ServiceProcess({ process }: ServiceProcessProps) {
//   const container = {
//     hidden: { opacity: 0 },
//     show: {
//       opacity: 1,
//       transition: {
//         staggerChildren: 0.1
//       }
//     }
//   };

//   const item = {
//     hidden: { opacity: 0, y: 20 },
//     show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
//   };

//   return (
//     <section className="w-full py-12 md:py-16 lg:py-20 bg-white">
//       <div className="max-w-[1380px] mx-auto px-4 md:px-6">
//         <motion.h2 
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true, margin: "-100px" }}
//           className="text-2xl md:text-3xl font-bold text-slate-900 mb-12"
//         >
//           Our {process.length}-Step Process
//         </motion.h2>

//         <motion.div 
//           variants={container}
//           initial="hidden"
//           whileInView="show"
//           viewport={{ once: true, margin: "-100px" }}
//           className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
//         >
//           {process.map((p) => (
//             <motion.div key={p.step} variants={item} className="flex flex-col">
//               <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mb-5 shadow-md shadow-blue-600/30">
//                 {p.step}
//               </div>
//               <h3 className="text-base font-bold text-slate-900 mb-2">
//                 {p.title}
//               </h3>
//               <p className="text-sm text-slate-500 leading-relaxed">
//                 {p.description}
//               </p>
//             </motion.div>
//           ))}
//         </motion.div>
//       </div>
//     </section>
//   );
// }
"use client";

import { motion, type Variants } from "framer-motion";

interface ProcessStep {
  step: number;
  title: string;
  description: string;
}

interface ServiceProcessProps {
  process: ProcessStep[];
}

export function ServiceProcess({ process }: ServiceProcessProps) {
  const container: Variants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.18,
      },
    },
  };

  const card: Variants = {
    hidden: (direction: "left" | "right") => ({
      opacity: 0,
      x: direction === "left" ? -60 : 60,
      y: 15,
    }),

    show: {
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.65,
        ease: "easeOut",
      },
    },
  };

  const node: Variants = {
    hidden: {
      opacity: 0,
      scale: 0.4,
    },

    show: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.45,
        ease: "backOut",
      },
    },
  };

  const connector: Variants = {
    hidden: {
      scaleX: 0,
      opacity: 0,
    },

    show: {
      scaleX: 1,
      opacity: 1,
      transition: {
        duration: 0.45,
        delay: 0.15,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-20 md:py-24">
      <div className="mx-auto max-w-[1380px] px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >
          <span className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            How It Works
          </span>

          <h2 className="mt-5 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Our {process.length}-Step Process
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-500 md:text-base">
            From careful inspection to final delivery, every garment goes
            through a carefully managed process.
          </p>
        </motion.div>

        {/* Process Tree */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
          className="relative mx-auto max-w-5xl"
        >
          {/* Main Tree Line */}
          <div className="absolute bottom-7 left-1/2 top-7 hidden w-px -translate-x-1/2 bg-slate-200 md:block" />

          {/* Active Line */}
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{
              duration: 1.8,
              ease: "easeInOut",
            }}
            style={{ originY: 0 }}
            className="absolute bottom-7 left-1/2 top-7 hidden w-[2px] -translate-x-1/2 bg-gradient-to-b from-primary via-secondary to-primary md:block"
          />

          <div className="space-y-14 md:space-y-20">
            {process.map((p, index) => {
              const isLeft = index % 2 === 0;
              const direction = isLeft ? "left" : "right";

              return (
                <div
                  key={p.step}
                  className="relative grid items-center md:grid-cols-[1fr_80px_1fr]"
                >
                  {/* LEFT CONTENT */}
                  <div
                    className={`hidden md:block ${
                      isLeft ? "pr-10" : ""
                    }`}
                  >
                    {isLeft && (
                      <motion.div
                        custom="left"
                        variants={card}
                        className="group text-right"
                      >
                        {/* <div className="inline-block max-w-lg"> */}
                        <div className="inline-block max-w-lg rounded-2xl border border-slate-200 bg-white/80 p-6 text-right shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">
                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            Step {String(p.step).padStart(2, "0")}
                          </span>

                          <h3 className="mt-2 text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-primary md:text-2xl">
                            {p.title}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                            {p.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* CENTER NODE */}
                  <div className="relative z-20 flex justify-center">
                    <motion.div
                      variants={node}
                      className="relative flex h-16 w-16 items-center justify-center rounded-full border-[5px] border-white bg-primary text-lg font-bold text-white shadow-xl shadow-primary/25"
                    >
                      {String(p.step).padStart(2, "0")}

                      {/* Glow */}
                      <motion.div
                        animate={{
                          scale: [1, 1.35, 1],
                          opacity: [0.25, 0, 0.25],
                        }}
                        transition={{
                          duration: 2.5,
                          repeat: Infinity,
                          ease: "easeOut",
                        }}
                        className="absolute inset-0 -z-10 rounded-full bg-primary"
                      />
                    </motion.div>
                  </div>

                  {/* RIGHT CONTENT */}
                  <div
                    className={`hidden md:block ${
                      !isLeft ? "pl-10" : ""
                    }`}
                  >
                    {!isLeft && (
                      <motion.div
                        custom="right"
                        variants={card}
                        className="group text-left"
                      >
<div className="inline-block max-w-lg rounded-2xl border border-slate-200 bg-white/80 p-6 text-left shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:shadow-md">                          <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                            Step {String(p.step).padStart(2, "0")}
                          </span>

                          <h3 className="mt-2 text-xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-primary md:text-2xl">
                            {p.title}
                          </h3>

                          <p className="mt-3 text-sm leading-7 text-slate-500 md:text-base">
                            {p.description}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  {/* HORIZONTAL CONNECTOR */}
                  <motion.div
                    variants={connector}
                    className={`absolute top-1/2 hidden h-[2px] w-10 bg-primary/30 md:block ${
                      isLeft
                        ? "right-[calc(50%+40px)] origin-right"
                        : "left-[calc(50%+40px)] origin-left"
                    }`}
                  />

                  {/* MOBILE */}
                  <motion.div
                    variants={card}
                    custom={direction}
                    className="mt-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:hidden"
                  >
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
                      Step {String(p.step).padStart(2, "0")}
                    </span>

                    <h3 className="mt-2 text-lg font-bold text-slate-900">
                      {p.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-500">
                      {p.description}
                    </p>
                  </motion.div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </section>
  );
}