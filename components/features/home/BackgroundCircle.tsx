"use client";

import { motion } from "framer-motion";
import { RefObject } from "react";

interface BackgroundCircleProps {
  circleRef?: RefObject<HTMLDivElement | null>;
  wordIndex: number;
  showLogo: boolean;
  totalWords: number;
}

export default function BackgroundCircle({
  circleRef,
  wordIndex,
  showLogo,
  totalWords,
}: BackgroundCircleProps) {
  return (
    <motion.div
      ref={circleRef}
      className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
      initial={{ bottom: "-95%" }}
      animate={{
        bottom: showLogo ? "-100%" : `${-95 + (wordIndex / totalWords) * 80}%`,
        opacity: showLogo ? 0 : 1,
      }}
      transition={{
        type: "spring",
        stiffness: 60,
        damping: 20,
        mass: 1,
      }}
      style={{
        width: "min(1000px, 90vw)",
        height: "min(1000px, 90vw)",
      }}
    >
      <div
        className="h-full w-full rounded-full"
        style={{ border: "1px solid rgba(100, 130, 200, 0.35)" }}
      />
    </motion.div>
  );
}
