"use client";

import { motion } from "framer-motion";

interface ScrollHintProps {
  /** Seconds to wait before it fades in (the hero logo draws first). */
  delay?: number;
  className?: string;
  /** id of the element to scroll to; without a match the page scrolls down one screen. */
  targetId?: string;
}

/** Scroll one screen down, to the services section when the page has an anchor for it. */
function scrollDown(targetId: string) {
  const target = document.getElementById(targetId);
  if (target) {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  window.scrollBy({ top: window.innerHeight, behavior: "smooth" });
}

/** Stacked double downward chevrons with a cascading downward pulse. */
export function DoubleDownArrow({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      className={`shrink-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.45)] ${className}`}
    >
      <path
        d="M6 6.5L12 12.5L18 6.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scroll-arrow-top"
      />
      <path
        d="M6 12.5L12 18.5L18 12.5"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="scroll-arrow-bottom"
      />
    </svg>
  );
}

/** A double downward arrow with a cascading pulse, and the words "Scroll down". */
export default function ScrollHint({ delay = 0, className = "", targetId = "services" }: ScrollHintProps) {
  return (
    <motion.button
      type="button"
      onClick={() => scrollDown(targetId)}
      aria-label="Scroll down"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex cursor-pointer items-center gap-2.5 text-[14px] font-normal tracking-tight text-white/85 transition-colors hover:text-white focus-visible:text-white focus:outline-none ${className}`}
    >
      <span className="scroll-hint-bob flex items-center gap-2.5">
        <DoubleDownArrow className="h-[22px] w-[22px]" />
        <span className="text-[15px]">Scroll down</span>
      </span>
    </motion.button>
  );
}
