"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const HEADING: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 1.2, ease: EASE } },
};

/**
 * A chip set into the line of text, as tall as the lettering, that floats a little. It follows
 * the heading's own reveal (a small inline element watching the viewport by itself did not
 * always get noticed, and then stayed hidden).
 */
function FloatChip({ children, delay }: { children: ReactNode; delay: number }) {
  const reduced = useReducedMotion();
  const chip: Variants = {
    hidden: { opacity: 0, scale: 0.6, y: 24 },
    shown: { opacity: 1, scale: 1, y: 0, transition: { delay, duration: 0.9, ease: EASE } },
  };
  return (
    <motion.span variants={chip} className="relative mx-[0.14em] inline-block align-middle">
      <motion.span
        animate={reduced ? undefined : { y: [0, -5, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut", delay }}
        className="block"
      >
        {children}
      </motion.span>
    </motion.span>
  );
}

/**
 * The closing statement of the products page: a large light line ending in the logo chip, and a
 * quiet sub-line, centred on the pale page.
 */
export default function ProductsOutro() {
  return (
    <section className="relative flex min-h-[78dvh] w-full flex-col items-center justify-center px-6 text-center text-[#151716]">
      <motion.h2
        variants={HEADING}
        initial="hidden"
        whileInView="shown"
        viewport={{ once: true, margin: "-20%" }}
        className="max-w-[18ch] text-balance font-normal leading-[1.08] tracking-[-0.045em] sm:max-w-none"
        style={{ fontSize: "clamp(2.4rem, 1rem + 5vw, 6rem)" }}
      >
        Built for real businesses.
        <FloatChip delay={0.6}>
          <span className="relative block h-[0.62em] w-[0.62em] rounded-full bg-[#151716] shadow-[0_0_0_0.1em_rgba(34,180,90,0.22),0_0.2em_0.5em_-0.2em_rgba(0,0,0,0.5)] ring-[0.05em] ring-white max-md:h-[0.8em] max-md:w-[0.8em]">
            <Image src="/logo/Logoo-white.svg" alt="" fill sizes="64px" className="object-contain p-[0.11em]" />
          </span>
        </FloatChip>
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ delay: 0.4, duration: 1, ease: EASE }}
        className="mt-[clamp(1rem,2.4vw,1.9rem)] max-w-[34rem] text-[clamp(0.9rem,0.8rem+0.4vw,1.1rem)] text-black/55"
      >
        WorkHub and StockFlow are just the beginning. More simple, practical products are coming soon.
      </motion.p>
    </section>
  );
}
