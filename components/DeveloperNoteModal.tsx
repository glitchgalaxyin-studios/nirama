"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const POPUP_DELAY_MS = 60_000; // 1 minute (60 seconds)
const STORAGE_KEY = "nirama_creator_note_dismissed";

export default function DeveloperNoteModal() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPhone, setShowPhone] = useState(false);

  useEffect(() => {
    // Check if user already dismissed it in this session
    try {
      const isDismissed = sessionStorage.getItem(STORAGE_KEY);
      if (isDismissed === "true") return;
    } catch {
      // Ignore storage errors in private browsing
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, POPUP_DELAY_MS);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "true");
    } catch {
      // Ignore
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center p-4 sm:p-6 pointer-events-none">
          {/* Subtle Ambient Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/35 backdrop-blur-md pointer-events-auto transition-opacity"
          />

          {/* Elegant Floating Card */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative pointer-events-auto w-full max-w-xl rounded-[2.2rem] border border-[#B3945E]/40 bg-gradient-to-br from-[#FFFDF9]/95 via-[#FAF6EF]/95 to-[#F5ECE0]/95 p-6 sm:p-8 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur-3xl space-y-4"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleDismiss}
              className="absolute top-5 right-5 flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/80 text-black/60 shadow-xs hover:bg-black hover:text-white transition-all duration-200"
              aria-label="Close Note"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>

            {/* Header Badge */}
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B3945E]/30 bg-[#B3945E]/15 px-3.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-[#8C6F3B]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                Note From The Creator
              </span>
              <span className="text-xs text-black/40 font-mono">Student & Web Developer</span>
            </div>

            {/* Note Body */}
            <div className="space-y-2.5 text-xs sm:text-sm text-black/80 leading-relaxed pt-1">
              <p>
                Hey, I am truly glad you gave us the opportunity to build <strong className="font-semibold text-black">Nirāma</strong>. I am a student and a part-time web developer working hard to pay my tuition bills, support my family, and build an independent future. I also run my own creative studio at{" "}
                <a
                  href="https://glitchgalaxy.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-[#8C6F3B] underline underline-offset-2 hover:text-black transition-colors"
                >
                  glitchgalaxy.in
                </a>
                , where I craft custom websites for people.
              </p>

              <p>
                Please check out this prototype and consider our work while making your evaluation. If you find value in what we built, feel free to drop me an email or text—with your guidance and support, I can continue learning, growing, and building meaningful tools for India 🙂
              </p>
            </div>

            {/* Direct Contact Links */}
            <div className="pt-3 border-t border-[#B3945E]/20 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {/* Email */}
                <a
                  href="mailto:bhuvanjg.nova@gmail.com"
                  className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-xs hover:bg-black hover:text-white transition-colors"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#8C6F3B]">
                    <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                    <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                  </svg>
                  <span>bhuvanjg.nova@gmail.com</span>
                </a>

                {/* WhatsApp / Phone (Hidden until clicked) */}
                {showPhone ? (
                  <a
                    href="tel:9036151876"
                    className="inline-flex items-center gap-1.5 rounded-full border border-[#10B981]/40 bg-[#10B981]/10 px-3.5 py-1.5 text-xs font-semibold text-[#10B981] shadow-xs hover:bg-[#10B981] hover:text-white transition-colors"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>+91 90361 51876</span>
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhone(true)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-black/10 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-[#1A1A1A] shadow-xs hover:bg-black hover:text-white transition-colors cursor-pointer"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-[#10B981]">
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                    <span>Tap to Reveal Phone No.</span>
                  </button>
                )}

                {/* Portfolio */}
                <a
                  href="https://glitchgalaxy.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#B3945E]/40 bg-[#1A1A1A] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-black transition-colors"
                >
                  <span className="text-[#C9AB73]">✦</span>
                  <span>glitchgalaxy.in</span>
                </a>
              </div>

              {/* Dismiss Button */}
              <button
                type="button"
                onClick={handleDismiss}
                className="text-xs font-bold uppercase tracking-[0.16em] text-black/50 hover:text-black underline ml-auto"
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
