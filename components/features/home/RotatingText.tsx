"use client";

import { motion } from "framer-motion";
import FlowingSlot from "./FlowingSlot";

interface RotatingTextProps {
  wordIndex: number;
  words: string[];
}

const FONT_SIZE = "clamp(1.25rem, 5.2vw, 6rem)";

/**
 * "We build Brand / Business ... And Beyond." The prefix and the word are slots whose widths
 * glide, so the line stays centred the whole time and swaps cleanly with no overlap or gaps.
 */
export default function RotatingText({ wordIndex, words }: RotatingTextProps) {
  const isLast = wordIndex >= words.length - 1;

  return (
    <motion.div
      key="rotating-text-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
      className="flex w-full items-center justify-center gap-[0.28em] px-4 text-center font-light text-stage-ink"
      style={{ fontSize: FONT_SIZE }}
    >
      <FlowingSlot
        activeIndex={isLast ? 1 : 0}
        items={[
          <span key="we">
            We <span className="italic">build</span>
          </span>,
          <span key="and" className="italic">
            And
          </span>,
        ]}
      />
      <FlowingSlot activeIndex={wordIndex} items={words} />
    </motion.div>
  );
}
