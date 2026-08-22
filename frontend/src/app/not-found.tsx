// "use client";

// import Link from "next/link";
// import { ArrowLeft, Home, SearchX } from "lucide-react";
// import { motion } from "framer-motion";
// import { useRouter } from "next/navigation";
// import { DotLottieReact } from "@lottiefiles/dotlottie-react";

// export default function NotFound() {
//     const router = useRouter();
//     return (
//         <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6">
//             {/* Background Blur */}
//             <div className="absolute inset-0">
//                 <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
//                 <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-primary/10 blur-3xl" />
//             </div>
//             <motion.div
//                 initial={{ opacity: 0, y: 25 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ duration: .45 }}
//                 className="relative z-10 w-full max-w-xl rounded-3xl border border-border bg-card p-10 text-center shadow-xl"
//             >
//                 {/* Icon */}
//                 <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary">
//                     <SearchX className="h-10 w-10" />
//                 </div>
//                 {/* 404 */}
//                 {/* <h1 className="mt-8 text-7xl font-black tracking-tight text-foreground">
//                     404
//                 </h1> */}
//                 {/* 404 Animation */}
//                 <motion.div
//                     initial={{ opacity: 0, scale: 0.9 }}
//                     animate={{ opacity: 1, scale: 1 }}
//                     transition={{
//                         duration: 0.7,
//                         delay: 0.15,
//                         ease: [0.22, 1, 0.36, 1],
//                     }}
//                     className="mx-auto flex h-[220px] w-[280px] items-center justify-center sm:h-[260px] sm:w-[340px]"
//                 >
//                     <DotLottieReact
//                         src="/animations/404 page.lottie"
//                         loop
//                         autoplay
//                     />
//                 </motion.div>
//                 <h2 className="mt-3 text-3xl font-bold text-foreground">
//                     Page Not Found
//                 </h2>
//                 <p className="mx-auto mt-5 max-w-md leading-7 text-muted-foreground">
//                     The page you're looking for doesn't exist, may have been moved,
//                     or the URL might be incorrect.
//                 </p>
//                 {/* Buttons */}
//                 <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
//                     <Link
//                         href="/"
//                         className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
//                     >
//                         <Home className="h-4 w-4" />
//                         Back Home
//                     </Link>
//                     <button
//                         onClick={() => router.back()}
//                         className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-6 py-3 font-semibold text-foreground transition hover:bg-muted"
//                     >
//                         <ArrowLeft className="h-4 w-4" />
//                         Go Back
//                     </button>
//                 </div>
//                 {/* Footer */}
//                 <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
//                     Lost? Return to the homepage and continue exploring LAUNDRIX.
//                 </div>
//             </motion.div>
//         </main>
//     );
// }
"use client";

import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <main className="relative min-h-[100svh] w-full overflow-hidden bg-slate-50">
      {/* Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.12, 1],
          opacity: [0.25, 0.4, 0.25],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="
          pointer-events-none absolute
          -left-32 -top-32
          h-72 w-72
          rounded-full
          bg-blue-300/30
          blur-3xl
          sm:h-96 sm:w-96
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
        className="
          pointer-events-none absolute
          -bottom-40 -right-32
          h-80 w-80
          rounded-full
          bg-cyan-300/25
          blur-3xl
          sm:h-[450px] sm:w-[450px]
        "
      />

      {/* Subtle Grid */}
      <div
        className="
          pointer-events-none absolute inset-0
          opacity-[0.035]
          [background-image:linear-gradient(#0f172a_1px,transparent_1px),linear-gradient(90deg,#0f172a_1px,transparent_1px)]
          [background-size:40px_40px]
        "
      />

      {/* Main Content */}
      <div
        className="
          relative z-10
          flex min-h-[100svh]
          items-center justify-center
          px-4 py-6
          sm:px-6
          lg:px-8
        "
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            flex w-full max-w-2xl
            flex-col items-center
            text-center
          "
        >
          {/* Small Status Badge */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.45,
              delay: 0.1,
            }}
            className="
              inline-flex items-center gap-2
              rounded-full
              border border-blue-100
              bg-white/80
              px-3.5 py-1.5
              shadow-sm
              backdrop-blur-md
            "
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500" />
            </span>

            <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-blue-600">
              Error 404
            </span>
          </motion.div>

          {/* 404 Lottie Animation */}
          <motion.div
            initial={{ opacity: 0, scale: 0.82 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              flex
              h-[210px] w-[280px]
              items-center justify-center
              sm:h-[250px] sm:w-[350px]
              md:h-[285px] md:w-[400px]
            "
          >
            {/* Animation Glow */}
            <div className="absolute inset-x-12 bottom-5 h-12 rounded-full bg-blue-400/15 blur-2xl" />

            <DotLottieReact
              src="/animations/404 page.lottie"
              loop
              autoplay
              className="relative z-10 h-full w-full"
            />
          </motion.div>

          {/* Heading */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.35,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="-mt-2 sm:-mt-3"
          >
            <h1
              className="
                text-3xl font-extrabold
                tracking-tight text-slate-900
                sm:text-4xl
                md:text-5xl
              "
            >
              Page Not Found
            </h1>

            <p
              className="
                mx-auto mt-3
                max-w-md
                text-sm leading-6
                text-slate-500
                sm:text-base
              "
            >
              Looks like this page took a wrong turn. The page you’re looking
              for doesn’t exist or may have been moved.
            </p>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.48,
            }}
            className="
              mt-7
              flex w-full
              flex-col gap-3
              sm:w-auto sm:flex-row
            "
          >
            <Link
              href="/"
              className="
                group
                inline-flex items-center justify-center gap-2
                rounded-xl
                bg-blue-600
                px-6 py-3
                text-sm font-bold text-white
                shadow-lg shadow-blue-600/20
                transition-all duration-300
                hover:-translate-y-0.5
                hover:bg-blue-700
                hover:shadow-xl hover:shadow-blue-600/25
              "
            >
              <Home size={17} />

              Back to Home

              <motion.span
                initial={{ x: 0 }}
                whileHover={{ x: 3 }}
              >
                →
              </motion.span>
            </Link>

            <button
              onClick={() => router.back()}
              className="
                inline-flex items-center justify-center gap-2
                rounded-xl
                border border-slate-200
                bg-white/80
                px-6 py-3
                text-sm font-bold text-slate-700
                shadow-sm
                backdrop-blur-md
                transition-all duration-300
                hover:-translate-y-0.5
                hover:border-slate-300
                hover:bg-white
                hover:shadow-md
              "
            >
              <ArrowLeft size={17} />
              Go Back
            </button>
          </motion.div>

          {/* Bottom Text */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.5,
              delay: 0.65,
            }}
            className="
              mt-6
              text-[11px]
              font-medium
              text-slate-400
              sm:text-xs
            "
          >
            LAUNDRIX • Smart Laundry, Perfectly Delivered.
          </motion.p>
        </motion.div>
      </div>
    </main>
  );
}