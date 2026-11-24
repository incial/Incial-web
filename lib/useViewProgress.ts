"use client";

import { useCallback, useEffect, type RefObject } from "react";
import { useMotionValue, useMotionValueEvent, useScroll, type MotionValue } from "framer-motion";

/**
 * How far an element has risen into view: 0 while its top is at the bottom of the screen, 1 when
 * its top reaches the top of the screen. Read from the live layout on every scroll tick, so it
 * stays correct even when content around it loads late or pins and overlaps.
 */
export function useViewProgress(ref: RefObject<HTMLElement | null>): MotionValue<number> {
  const progress = useMotionValue(0);
  const { scrollY } = useScroll();

  const update = useCallback(() => {
    const element = ref.current;
    if (!element) return;
    const { top } = element.getBoundingClientRect();
    const viewport = window.innerHeight;
    progress.set(Math.min(1, Math.max(0, (viewport - top) / viewport)));
  }, [ref, progress]);

  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return progress;
}
