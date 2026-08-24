"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export default function LoadingScreen() {
  const pathname = usePathname();
  const [isLoading, setIsLoading] = useState(true);
  const isFirstMount = useRef(true);

  // Trigger on initial load and on every page switch (pathname change)
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const initialTimer = setTimeout(() => {
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(initialTimer);
    }

    // Page switch transition
    setIsLoading(true);
    const switchTimer = setTimeout(() => {
      setIsLoading(false);
    }, 550);

    return () => clearTimeout(switchTimer);
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="nirama-page-loader"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: { duration: 0.22, ease: [0.2, 0, 0, 1] },
          }}
          exit={{
            opacity: 0,
            transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#FCFBF8] select-none"
        >
          {/* Large Ambient Warm Golden / Emerald Aura */}
          <div className="pointer-events-none absolute h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(201,171,115,0.3)_0%,rgba(16,185,129,0.1)_45%,transparent_70%)] blur-3xl animate-pulse" />

          {/* Centered Large Logo Container */}
          <motion.div
            initial={{ scale: 0.88, opacity: 0, y: 10 }}
            animate={{
              scale: 1,
              opacity: 1,
              y: 0,
              transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
            }}
            exit={{
              scale: 1.06,
              opacity: 0,
              y: -8,
              transition: { duration: 0.28, ease: [0.2, 0, 0, 1] },
            }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Big Logo with Radiant Glow */}
            <div className="relative flex items-center justify-center p-4">
              <motion.div
                animate={{
                  scale: [1, 1.12, 1],
                  opacity: [0.4, 0.85, 0.4],
                }}
                transition={{
                  duration: 2.2,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-tr from-[#C9AB73]/30 via-[#10B981]/20 to-transparent blur-xl"
              />
              <img
                src="/logo.png"
                alt="Nirāma Logo"
                className="relative z-10 h-16 sm:h-20 md:h-24 w-auto object-contain drop-shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
              />
            </div>

            {/* Tagline & Badges */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{
                opacity: 1,
                y: 0,
                transition: { delay: 0.15, duration: 0.35 },
              }}
              className="flex flex-col items-center space-y-2 text-center"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-[#B3945E]/35 bg-[#B3945E]/10 px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#8C6F3B] shadow-xs backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Label Padhega India</span>
              </div>
              <p className="text-xs sm:text-sm text-black/50 tracking-widest font-mono uppercase">
                Multimodal Vision Intelligence
              </p>
            </motion.div>

            {/* Dynamic Gold Shimmer Track */}
            <div className="mt-1 h-1 w-44 sm:w-56 overflow-hidden rounded-full bg-black/5">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{
                  duration: 0.9,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="h-full w-full bg-gradient-to-r from-transparent via-[#C9AB73] to-transparent shadow-[0_0_8px_#C9AB73]"
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
