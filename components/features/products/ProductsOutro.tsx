"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

/** A chip set into the line of text, as tall as the lettering, that floats a little. */
function FloatChip({ children, delay, rotate = 0, className = "" }: { children: ReactNode; delay: number; rotate?: number; className?: string }) {
  const reduced = useReducedMotion();
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.6, y: 24 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: true, margin: "-20%" }}
      transition={{ delay, duration: 0.9, ease: EASE }}
      className={`relative mx-[0.14em] inline-block align-middle ${className}`}
      style={{ rotate }}
    >
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

/** A small document with a signature and a green tick; sized in em, so it follows the text around it. */
function DocCard() {
  return (
        <span className="relative block h-[1.1em] w-[0.9em] rounded-[0.14em] bg-white p-[0.14em] shadow-[0_0.3em_0.6em_-0.25em_rgba(0,0,0,0.35)] ring-1 ring-black/5">
          <span className="block h-[0.17em] w-[0.17em] rounded-full bg-[#151716]" />
          <span className="mt-[0.1em] block h-[0.05em] w-[60%] rounded bg-black/15" />
          <span className="mt-[0.06em] block h-[0.05em] w-[85%] rounded bg-black/10" />
          <span className="mt-[0.06em] block h-[0.05em] w-[70%] rounded bg-black/10" />
          <svg aria-hidden viewBox="0 0 40 16" className="absolute bottom-[0.2em] left-[0.14em] h-[0.26em] w-[0.6em] fill-none stroke-[#151716]" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 11c4-8 6 3 9-2s4-4 6 0 5-6 8 0 6-3 9 2" />
          </svg>
          <span className="absolute -right-[0.16em] -top-[0.16em] flex h-[0.34em] w-[0.34em] items-center justify-center rounded-full bg-[#22b45a] shadow-sm">
            <svg aria-hidden viewBox="0 0 12 12" className="h-[0.19em] w-[0.19em] fill-none stroke-white" strokeWidth="1.8">
              <path d="M2.5 6.3l2.3 2.3L9.5 3.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </span>
  );
}

/**
 * The closing statement of the products page: a large light line with two small chips set into it
 * and a quiet sub-line, centred on the pale page.
 */
export default function ProductsOutro() {
  return (
    <section className="relative flex min-h-[78dvh] w-full flex-col items-center justify-center px-6 text-center text-[#151716]">
      {/* on phones the document sits above the line, large */}
      <div className="mb-8 text-[5.5rem] md:hidden">
        <FloatChip delay={0.3} rotate={-4}>
          <DocCard />
        </FloatChip>
      </div>
      <motion.h2
        initial={{ opacity: 0, y: 40, filter: "blur(12px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-20%" }}
        transition={{ duration: 1.2, ease: EASE }}
        className="max-w-[18ch] text-balance font-normal leading-[1.08] tracking-[-0.045em] sm:max-w-none"
        style={{ fontSize: "clamp(2.4rem, 1rem + 5vw, 6rem)" }}
      >
        Built for{" "}
        <FloatChip delay={0.5} rotate={-4} className="max-md:hidden">
          <DocCard />
        </FloatChip>
        {" "}real businesses.
        <FloatChip delay={0.75}>
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
