"use client";

import { useEffect, useRef, type MutableRefObject } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Smooth, inertial page scrolling with Lenis, driven by GSAP's ticker so every ScrollTrigger
 * animation reads the exact same (smoothed) scroll position as the page. Returns a ref to the
 * Lenis instance (null when the user prefers reduced motion).
 */
export function useSmoothScroll(): MutableRefObject<Lenis | null> {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // lerp: each frame closes a share of the gap, so the page follows the wheel and settles soon
    // after it stops (the same feel as the home page)
    const lenis = new Lenis({ lerp: 0.12, smoothWheel: true, autoRaf: false });
    lenisRef.current = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return lenisRef;
}
