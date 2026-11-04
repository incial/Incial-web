"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SkeletonBlockProps {
  className?: string;
}

/**
 * Loading placeholder: silver at 30% over black with a soft sweep. It covers its (relative)
 * parent, so it replaces a white tile while its content loads and stays visible on black.
 */
export default function SkeletonBlock({ className = "" }: SkeletonBlockProps) {
  const reduceMotion = useReducedMotion();

  return (
    <span aria-hidden className={`absolute inset-0 overflow-hidden bg-black ${className}`}>
      <span className="absolute inset-0" style={{ background: "rgba(192, 192, 192, 0.3)" }} />
      {!reduceMotion && (
        <motion.span
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.16), transparent)",
          }}
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{ duration: 1.4, ease: "easeInOut", repeat: Infinity }}
        />
      )}
    </span>
  );
}
