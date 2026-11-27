"use client";

import { motion, useReducedMotion } from "framer-motion";
import GlassLottie from "@/components/ui/GlassLottie";
import GlassTorus from "@/components/ui/GlassTorus";

export type GlassPillKind = "torus" | "twist";

interface GlassPillProps {
  kind: GlassPillKind;
  /** False while the reading has not reached it yet: it waits small and grey. */
  lit?: boolean;
  /** Seconds before it pops in (when it does not wait for `lit`). */
  delay?: number;
}

/**
 * An interactive glass element set into a line of text like a word: a dark oval as tall as the
 * lettering holding the glass ring or the glass twist. It springs up in full colour once `lit`,
 * floats a little, grows and tilts under the pointer (the ring's blades part around it, the twist
 * leans toward it), and presses in when tapped.
 */
export default function GlassPill({ kind, lit = true, delay = 0 }: GlassPillProps) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      aria-hidden
      className="relative mx-[0.08em] inline-block align-middle"
      initial={{ scale: 0.6, opacity: 0 }}
      animate={{ scale: lit ? 1 : 0.72, opacity: lit ? 1 : 0.35, filter: lit ? "grayscale(0)" : "grayscale(1)" }}
      transition={{ type: "spring", stiffness: 260, damping: 18, delay: lit ? delay : 0 }}
    >
      <motion.span
        className="block cursor-pointer"
        animate={reduced || !lit ? undefined : { y: [0, -4, 0] }}
        transition={{ duration: 3.6, repeat: Infinity, ease: "easeInOut" }}
        whileHover={{ scale: 1.12, rotate: kind === "torus" ? -6 : 6 }}
        whileTap={{ scale: 0.92 }}
      >
        <span className="relative block h-[0.92em] w-[1.9em] overflow-hidden rounded-full border border-white/15 bg-[#0c0f1a] shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_0.3em_0.9em_-0.35em_rgba(20,99,255,0.7)]">
          {kind === "torus" ? (
            <span className="absolute left-1/2 top-1/2 block h-[150%] w-[85%] -translate-x-1/2 -translate-y-1/2">
              <GlassTorus className="h-full w-full" bladeCount={28} speed={0.9} />
            </span>
          ) : (
            <GlassLottie
              name="glass-twist"
              interactive
              className="absolute left-1/2 top-1/2 aspect-[1696/928] w-[150%] -translate-x-1/2 -translate-y-1/2 mix-blend-screen"
            />
          )}
        </span>
      </motion.span>
    </motion.span>
  );
}
