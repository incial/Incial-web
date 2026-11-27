"use client";

import { useLayoutEffect, type RefObject } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/** Shared easings: a soft ease-out for entrances and an ease-in-out for scrubbed movement. */
export const EASE_OUT = "expo.out";
export const EASE_IN_OUT = "power3.inOut";

/**
 * Runs a section's GSAP timeline inside a context scoped to `ref`, so every tween and
 * ScrollTrigger it makes is removed when the section unmounts. `isDesktop` comes from
 * gsap.matchMedia, so pinned or horizontal effects can be desktop-only. Nothing runs when the
 * visitor prefers reduced motion (the content is simply shown).
 */
export function useSectionMotion(
  ref: RefObject<HTMLElement | null>,
  build: (context: { isDesktop: boolean; root: HTMLElement }) => void | (() => void),
) {
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const media = gsap.matchMedia(root);
    media.add(
      {
        isDesktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        isMobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
      },
      (context) => {
        const { isDesktop } = context.conditions as { isDesktop: boolean };
        return build({ isDesktop, root });
      },
    );
    return () => media.revert();
    // the build function is defined inline by each section and only needs to run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ref]);
}

/** Splits text into word spans (kept as words so lines wrap naturally) for word-by-word motion. */
export function words(text: string) {
  return text.split(/\s+/).filter(Boolean);
}
