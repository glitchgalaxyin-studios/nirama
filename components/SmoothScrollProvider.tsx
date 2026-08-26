"use client";

import { useEffect } from "react";
import Lenis from "lenis";

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.3,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier: 1.05,
      touchMultiplier: 1.8,
    });

    // Expose lenis globally
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    let rafId: number;

    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Global interceptor for all internal anchor hash links (#section-id)
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement)?.closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Handle both internal "#hash" and "/#hash" when on root page
      let hash = "";
      if (href.startsWith("#") && href.length > 1) {
        hash = href;
      } else if (href.startsWith("/#") && href.length > 2 && window.location.pathname === "/") {
        hash = href.replace("/", "");
      }

      if (hash && hash !== "#") {
        const targetElement = document.querySelector(hash);
        if (targetElement) {
          e.preventDefault();
          lenis.scrollTo(targetElement as HTMLElement, {
            offset: -85,
            duration: 1.4,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          });
          window.history.pushState(null, "", hash);
        }
      }
    };

    document.addEventListener("click", handleAnchorClick, { capture: true });

    // Handle initial hash on page load if present
    if (window.location.hash) {
      setTimeout(() => {
        const initialTarget = document.querySelector(window.location.hash);
        if (initialTarget) {
          lenis.scrollTo(initialTarget as HTMLElement, {
            offset: -85,
            duration: 1.2,
          });
        }
      }, 250);
    }

    return () => {
      document.removeEventListener("click", handleAnchorClick, { capture: true });
      cancelAnimationFrame(rafId);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
    };
  }, []);

  return <>{children}</>;
}
