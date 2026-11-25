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

/** A small mouse outline with a dot that drifts down, and the words "Scroll down". */
export default function ScrollHint({ delay = 0, className = "", targetId = "services" }: ScrollHintProps) {
  return (
    <motion.button
      type="button"
      onClick={() => scrollDown(targetId)}
      aria-label="Scroll down"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`group flex items-center gap-3 text-[14px] font-normal tracking-tight text-white/85 transition-colors hover:text-white focus-visible:text-white focus:outline-none ${className}`}
    >
      {/* the whole hint bobs downward, and a ring pulses out of the mouse, so it catches the eye */}
      <span className="scroll-hint-bob flex items-center gap-3">
        <span
          aria-hidden
          className="scroll-hint-pulse relative flex h-[34px] w-[22px] justify-center rounded-full border-[1.5px] border-current pt-[7px]"
        >
          <span className="scroll-hint-dot block h-[6px] w-[3px] rounded-full bg-current" />
        </span>
        <span className="text-[15px]">Scroll down</span>
      </span>
    </motion.button>
  );
}
