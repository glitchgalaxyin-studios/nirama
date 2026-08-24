"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

type Stage = 0 | 1 | 2 | 3;

const stagesInfo = [
  { id: 0, title: "01 · Home Landing" },
  { id: 1, title: "02 · Label Scanner" },
  { id: 2, title: "03 · AI Reasoning" },
  { id: 3, title: "04 · Audit Report" },
];

export default function PhoneMockupShowcase() {
  const [currentStage, setCurrentStage] = useState<Stage>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-play loop through stages
  useEffect(() => {
    if (!isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStage((prev) => ((prev + 1) % 4) as Stage);
    }, 4500);
    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  // Smooth scroll sync inside the phone screen
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    if (currentStage === 0) {
      el.scrollTo({ top: 0, behavior: "smooth" });
    } else if (currentStage === 1) {
      el.scrollTo({ top: 160, behavior: "smooth" });
    } else if (currentStage === 2) {
      el.scrollTo({ top: 380, behavior: "smooth" });
    } else if (currentStage === 3) {
      el.scrollTo({ top: 580, behavior: "smooth" });
    }
  }, [currentStage]);

  return (
    <div className="flex flex-col items-center justify-center select-none w-full">
      {/* 2D Clean Smartphone Frame (No 3D, No Background Glows) */}
      <div className="relative w-[295px] sm:w-[325px] h-[585px] sm:h-[625px] rounded-[3.2rem] border-[7px] border-[#1C1C1E] bg-[#1C1C1E] shadow-[0_24px_50px_rgba(0,0,0,0.14)] p-1.5 flex flex-col justify-between overflow-hidden">
        
        {/* Physical Button Accents */}
        <div className="absolute -left-[9px] top-24 h-8 w-[3px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute -left-[9px] top-36 h-12 w-[3px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute -left-[9px] top-52 h-12 w-[3px] rounded-l-sm bg-[#3A3A3C]" />
        <div className="absolute -right-[9px] top-32 h-16 w-[3px] rounded-r-sm bg-[#3A3A3C]" />

        {/* Screen Bezel & Display Viewport */}
        <div className="relative w-full h-full rounded-[2.6rem] bg-[#FCFBF8] text-[#1A1A1A] overflow-hidden flex flex-col justify-between">
          
          {/* Dynamic Island Speaker Notch */}
          <div className="sticky top-0 z-30 pt-2 pb-1 bg-[#FCFBF8]/90 backdrop-blur-md flex justify-center">
            <div className="h-4 w-28 rounded-full bg-black flex items-center justify-between px-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
              <span className="text-[0.52rem] text-white/80 font-mono tracking-wider">NIRĀMA</span>
              <div className="h-1.5 w-1.5 rounded-full bg-amber-400" />
            </div>
          </div>

          {/* Actual Scrollable Website Canvas */}
          <div
            ref={scrollContainerRef}
            className="flex-1 w-full overflow-y-auto px-3 py-1 space-y-4 scroll-smooth scrollbar-none"
            style={{ scrollbarWidth: "none" }}
          >
            {/* 1. ACTUAL WEBSITE HEADER */}
            <div className="rounded-full border border-black/5 bg-white/95 px-3 py-1.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-1.5">
                <img src="/logo.png" alt="Logo" className="h-4 w-auto object-contain" />
              </div>
              <span className="rounded-full bg-[#B3945E]/15 px-2 py-0.5 text-[0.52rem] font-bold text-[#8C6F3B]">
                OpenAI × FoodPharmer
              </span>
            </div>

            {/* 2. ACTUAL HERO SECTION CONTENT */}
            <div className="text-center space-y-2 pt-1 px-1">
              <h2 className="text-xs font-semibold tracking-tight text-[#1A1A1A] leading-tight">
                Pure clarity.{" "}
                <span className="bg-gradient-to-r from-[#B3945E] to-[#8C6F3B] bg-clip-text text-transparent">
                  Scan past the marketing illusion.
                </span>
              </h2>

              <p className="text-[0.55rem] text-black/60 leading-relaxed">
                Decode hidden sugars, refined palm oil, and cryptic INS additives in 4pt font.
              </p>

              {/* Simulated Launch Scanner Button */}
              <div className="pt-1">
                <Link
                  href="/scan"
                  className={`inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-sm transition-all ${
                    currentStage === 0
                      ? "bg-[#1A1A1A] ring-2 ring-[#B3945E] scale-105"
                      : "bg-[#1A1A1A]"
                  }`}
                >
                  <span>Launch Scanner</span>
                  <span>&rarr;</span>
                </Link>
              </div>
            </div>

            {/* 3. ACTUAL SCANNER INGESTION BOX WITH USER BOURNVITA IMAGE */}
            <div className="rounded-2xl border border-black/10 bg-white/95 p-3 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[0.55rem] font-bold uppercase tracking-wider text-[#8C6F3B]">
                  Active Label Scanner
                </span>
                <span className="text-[0.5rem] text-black/40">Multimodal Vision</span>
              </div>

              {/* Slot 1: Back Label with User Uploaded Image */}
              <div className="rounded-xl border border-dashed border-[#B3945E]/40 bg-[#B3945E]/[0.03] p-1.5 text-center">
                <div className="flex items-center justify-between mb-1 text-[0.52rem] font-bold text-black/70">
                  <span>Slot 1 · Back Label (Ingredients)</span>
                  {currentStage >= 1 && (
                    <span className="text-[#10B981] flex items-center gap-0.5 text-[0.48rem]">
                      ✓ Ready
                    </span>
                  )}
                </div>

                {currentStage >= 1 ? (
                  <div className="relative h-40 sm:h-44 w-full rounded-lg overflow-hidden border border-black/10 bg-black/5 flex flex-col justify-between">
                    <img
                      src="/bournvita-back.png"
                      alt="Cadbury Bournvita Back Label"
                      className="h-full w-full object-cover object-center"
                    />

                    {/* Animated Scanning Laser Line in Stage 1 */}
                    {currentStage === 1 && (
                      <>
                        <div
                          className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#C9AB73] to-transparent shadow-[0_0_12px_#C9AB73] animate-pulse"
                          style={{ top: "58%" }}
                        />
                        {/* Live OCR Bounding Box over the real ingredients */}
                        <div className="absolute right-1.5 bottom-6 w-[125px] rounded-md border border-amber-400 bg-black/75 backdrop-blur-xs p-1 text-[0.45rem] font-mono text-white shadow-sm">
                          <span className="text-[0.4rem] font-bold text-[#C9AB73] block uppercase tracking-wider">
                            Decoded Ingredients:
                          </span>
                          Sugar, Maltodextrin, INS 150c, Liquid Glucose...
                        </div>
                      </>
                    )}

                    <div className="absolute bottom-1 left-1 rounded bg-black/70 backdrop-blur-xs px-1.5 py-0.5 text-[0.45rem] text-white">
                      Bournvita Back Panel · 500g
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-[0.5rem] text-black/40">
                    Tap to snap back nutritional panel
                  </div>
                )}
              </div>

              {/* Slot 2: Front Cover */}
              <div className="rounded-xl border border-dashed border-black/10 bg-black/[0.01] p-1.5 text-center text-[0.48rem] text-black/40">
                Slot 2 · Front Marketing Claims (Optional)
              </div>

              {/* Audit Button */}
              <Link
                href="/scan"
                className="block w-full rounded-xl bg-gradient-to-r from-[#C9AB73] to-[#A88851] py-1.5 text-center text-[0.55rem] font-bold uppercase tracking-wider text-white shadow-xs hover:scale-105 active:scale-95 transition"
              >
                {currentStage === 2 ? "Auditing Formulation..." : "Launch Tool →"}
              </Link>
            </div>

            {/* 4. ACTUAL REASONING STATE */}
            {currentStage === 2 && (
              <div className="rounded-2xl border border-white/90 bg-white/95 p-3 text-center space-y-2 shadow-xs">
                {/* Morphing Orb */}
                <div className="mx-auto relative h-12 w-12 flex items-center justify-center">
                  <div className="absolute h-10 w-10 rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(201,171,115,0.9),rgba(16,185,129,0.5))] blur-[2px] animate-spin" />
                  <div className="absolute h-6 w-6 rounded-full border border-white bg-white/60 backdrop-blur-md" />
                </div>
                <div>
                  <span className="text-[0.52rem] font-bold uppercase tracking-widest text-[#8C6F3B]">
                    Nirāma Multi-Stage Reasoning
                  </span>
                  <p className="text-[0.5rem] text-black/60 mt-0.5">
                    Deciphering INS 150c & calculating sugar teaspoons...
                  </p>
                </div>
              </div>
            )}

            {/* 5. ACTUAL COMPLETE FOOD AUDIT REPORT */}
            <div
              className={`rounded-2xl border border-white/90 bg-white/95 p-2.5 space-y-2 shadow-xs transition-all ${
                currentStage === 3 ? "opacity-100 ring-2 ring-[#B3945E]/50" : "opacity-90"
              }`}
            >
              {/* Product Title & Score */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="rounded-full bg-red-500/10 px-1.5 py-0.5 text-[0.45rem] font-bold text-red-700">
                    Strictly a Treat / Highly Processed
                  </span>
                  <h3 className="text-[0.62rem] font-medium text-[#1A1A1A] mt-0.5">
                    Bournvita Nutrition Drink
                  </h3>
                  <p className="text-[0.48rem] text-black/45">Mondelez / Cadbury India</p>
                </div>

                <div className="rounded-xl border border-black/5 bg-[#FCFBF8] p-1.5 text-center">
                  <span className="text-[0.45rem] text-black/40 uppercase font-bold">Purity Index</span>
                  <p className="text-sm font-light text-red-700">2<span className="text-[0.48rem] text-black/40">/10</span></p>
                </div>
              </div>

              {/* 2x2 Metric Cards */}
              <div className="grid grid-cols-2 gap-1.5 text-[0.5rem]">
                <div className="rounded-xl bg-[#FCEFEB] p-1.5 border border-[#F5C9C0]">
                  <span className="text-[0.42rem] font-bold text-red-800 uppercase block">Total Sugar</span>
                  <span className="font-semibold text-[#1A1A1A] text-[0.6rem]">49.8g</span>
                  <span className="text-black/50 block text-[0.45rem]">12.5 tsp / 100g</span>
                </div>

                <div className="rounded-xl bg-[#FCEFEB] p-1.5 border border-[#F5C9C0]">
                  <span className="text-[0.42rem] font-bold text-red-800 uppercase block">Primary Fat</span>
                  <span className="font-semibold text-[#1A1A1A] text-[0.55rem]">Refined Palm Oil</span>
                  <span className="text-red-700 block text-[0.45rem]">Ultra-Processed</span>
                </div>
              </div>

              {/* Desi Swap Card */}
              <div className="rounded-xl bg-[#64825E]/10 p-2 border border-[#64825E]/20 text-[0.5rem]">
                <span className="text-[0.45rem] font-bold text-[#496B43] uppercase tracking-wider block">
                  Clean Desi Kitchen Swap:
                </span>
                <p className="text-[#3A5635] font-semibold mt-0.5">
                  Roasted Sattu Badam Shake
                </p>
                <p className="text-black/60 text-[0.45rem] mt-0.5 leading-tight">
                  0g refined sugar, 9g natural protein, zero industrial chemicals.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Screen Home Bar */}
          <div className="sticky bottom-0 z-30 pt-1.5 pb-1 flex flex-col items-center bg-[#FCFBF8]/95 border-t border-black/5">
            <div className="h-1 w-20 rounded-full bg-black/25" />
          </div>
        </div>
      </div>

      {/* Interactive Process Stage Timeline Controls with Pop Micro-Animations */}
      <div className="mt-3.5 flex flex-wrap items-center justify-center gap-1.5 max-w-md">
        {stagesInfo.map((stage) => (
          <motion.button
            whileHover={{ scale: 1.06, y: -1 }}
            whileTap={{ scale: 0.94 }}
            key={stage.id}
            onClick={() => {
              setCurrentStage(stage.id as Stage);
              setIsAutoPlaying(false);
            }}
            className={`rounded-full px-3.5 py-1 text-[0.65rem] font-semibold tracking-wider transition-colors shadow-xs ${
              currentStage === stage.id
                ? "bg-[#1A1A1A] text-white shadow-md border border-[#B3945E]"
                : "bg-white/80 text-black/60 hover:bg-white hover:text-black border border-black/5"
            }`}
          >
            {stage.title}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
