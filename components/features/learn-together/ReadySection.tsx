"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import LiquidButton from "@/components/ui/LiquidButton";
import { Coder, Maker, Marketer, Designer } from "./Characters";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/**
 * ReadySection — a bold editorial closer (MindMarket + Flying Papers inspired):
 *
 * Layout (top → bottom):
 *   1. Dark-ink full-bleed canvas (contrast from the warm-paper body above)
 *   2. Display headline: "Start Building With Us." in staggered wipe-up lines
 *   3. Stats strip: three large numeric tiles (tilted, overlapping on scroll)
 *      that anchor the section with graphic weight — inspired by MindMarket's
 *      60+ / 400+ / 50+ overlapping stat cards.
 *   4. Three full-width action rows — one per JOIN_POINT — in the page's accent
 *      colours (sun / coral / lime). Each row is a large rounded card:
 *        • Number pill (top-left)
 *        • Huge display label (left)
 *        • Sub-line + mascot peeking from bottom-right corner
 *      Rows enter from alternating sides; mascots lift on row-hover.
 *   5. CTA block: centred copy + two buttons + Designer & Marketer mascots that
 *      pop up from the lower corners of a dark-ink card.
 *
 * All motion is CSS-composited transform/opacity; passive listener on pointermove.
 * Off for prefers-reduced-motion (globals.css handles lt-* classes).
 */

const STATS: ReadonlyArray<{ value: string; label: string; color: string; ink: string; rotate: number }> = [
  { value: "4", label: "Learning Tracks", color: LT_COLORS.lilac, ink: "#1a0033", rotate: -4 },
  { value: "100%", label: "Hands-On Output", color: LT_COLORS.sun, ink: "#1a1500", rotate: 2 },
  { value: "Real", label: "World Experience", color: LT_COLORS.lime, ink: "#0d1a00", rotate: -2 },
];

const ROWS: ReadonlyArray<{
  num: string;
  label: string;
  sub: string;
  color: string;
  ink: string;
  dir: "left" | "right";
  mascot: "designer" | "coder" | "marketer" | "maker";
}> = [
  {
    num: "01",
    label: "JOIN A WORKSHOP.",
    sub: "Hands-on sessions led by practitioners.",
    color: LT_COLORS.sun,
    ink: "#1a1500",
    dir: "right",
    mascot: "coder",
  },
  {
    num: "02",
    label: "COLLABORATE WITH PEERS.",
    sub: "Build alongside like-minded creators.",
    color: LT_COLORS.coral,
    ink: "#200800",
    dir: "left",
    mascot: "marketer",
  },
  {
    num: "03",
    label: "TURN SKILLS INTO OUTPUT.",
    sub: "Portfolio-ready work. Real results.",
    color: LT_COLORS.lime,
    ink: "#0d1a00",
    dir: "right",
    mascot: "maker",
  },
];

export default function ReadySection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    // headline words wipe up
    gsap.from("[data-rs-word]", {
      yPercent: 110,
      duration: 1.1,
      ease: EASE_OUT,
      stagger: 0.08,
      scrollTrigger: { trigger: root, start: "top 78%" },
    });

    // stat tiles overlap-fan in from bottom, slightly staggered
    gsap.from("[data-rs-stat]", {
      y: 80,
      scale: 0.88,
      opacity: 0,
      duration: 1,
      ease: "back.out(1.4)",
      stagger: 0.14,
      scrollTrigger: { trigger: "[data-rs-stats]", start: "top 85%" },
    });

    // action rows enter from alternating sides
    gsap.utils.toArray<HTMLElement>("[data-rs-row]").forEach((row, i) => {
      gsap.from(row, {
        x: ROWS[i].dir === "right" ? "7%" : "-7%",
        opacity: 0,
        duration: 1,
        ease: EASE_OUT,
        scrollTrigger: { trigger: row, start: "top 88%" },
      });
    });

    // CTA block rises
    gsap.from("[data-rs-cta]", {
      y: 50,
      opacity: 0,
      duration: 1,
      ease: EASE_OUT,
      scrollTrigger: { trigger: "[data-rs-cta]", start: "top 90%" },
    });

    // mascots spring up
    gsap.from("[data-rs-mascot]", {
      yPercent: 110,
      duration: 1.1,
      ease: "back.out(1.6)",
      stagger: 0.14,
      scrollTrigger: { trigger: "[data-rs-cta]", start: "top 85%" },
    });
  });

  return (
    <section
      ref={ref}
      className="overflow-hidden rounded-t-[2.5rem] md:rounded-t-[4rem]"
      style={{ background: LT_COLORS.ink }}
    >
      {/* ── 1. Headline ──────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-[1500px] px-5 pb-12 pt-20 sm:px-8 md:pb-16 md:pt-28 lg:px-12">
        <p className="mb-6 text-sm font-medium uppercase tracking-[0.22em] text-white/35">
          Ready to begin?
        </p>
        <h2
          className="text-[clamp(3rem,1.4rem+8vw,10rem)] font-semibold leading-[0.88] tracking-[-0.06em] text-white"
          aria-label="Start Building With Us"
        >
          {["Start", "Building", "With Us."].map((word) => (
            <span key={word} className="block overflow-hidden pb-[0.14em]">
              <span data-rs-word className="block">
                {word}
              </span>
            </span>
          ))}
        </h2>
      </div>

      {/* ── 2. Stats strip (MindMarket-style tilted number tiles) ────────── */}
      <div
        data-rs-stats
        className="mx-auto flex max-w-[1500px] flex-wrap gap-4 px-5 pb-16 sm:px-8 md:flex-nowrap md:gap-5 md:pb-20 lg:px-12"
      >
        {STATS.map((stat) => (
          <div
            key={stat.value}
            data-rs-stat
            className="flex flex-1 flex-col justify-between gap-3 rounded-[2rem] p-7 md:p-8"
            style={{ background: stat.color, transform: `rotate(${stat.rotate}deg)` }}
          >
            <span
              className="text-[clamp(2.8rem,1.4rem+6vw,7rem)] font-semibold leading-none tracking-[-0.06em]"
              style={{ color: stat.ink }}
            >
              {stat.value}
            </span>
            <span
              className="text-[clamp(0.9rem,0.8rem+0.5vw,1.15rem)] font-medium leading-tight opacity-70"
              style={{ color: stat.ink }}
            >
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* ── 3. Action rows ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 px-3 sm:px-5 md:px-6">
        {ROWS.map((row) => (
          <div
            key={row.num}
            data-rs-row
            className="group relative overflow-hidden rounded-[2rem] md:rounded-[2.5rem]"
            style={{ background: row.color }}
          >
            <div className="flex flex-col justify-between gap-4 px-7 py-8 md:flex-row md:items-end md:gap-6 md:px-10 md:py-9 lg:px-14 lg:py-11">
              {/* Left: number pill + big label */}
              <div className="flex flex-col gap-4">
                <span
                  className="w-fit rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.14em]"
                  style={{ background: "rgba(0,0,0,0.12)", color: row.ink }}
                >
                  {row.num}
                </span>
                <h3
                  className="text-[clamp(1.9rem,1rem+4.5vw,6rem)] font-semibold leading-[0.9] tracking-[-0.05em] transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3"
                  style={{ color: row.ink }}
                >
                  {row.label}
                </h3>
              </div>

              {/* Right: sub-text + mascot peeking from bottom */}
              <div className="flex shrink-0 flex-col items-start gap-3 md:items-end">
                <p
                  className="max-w-[22rem] text-[clamp(0.9rem,0.82rem+0.4vw,1.15rem)] leading-snug opacity-60 md:text-right"
                  style={{ color: row.ink }}
                >
                  {row.sub}
                </p>
                {/* Mascot peek — visible on md+ only */}
                <span
                  aria-hidden
                  className="pointer-events-none hidden w-[clamp(5rem,9vw,8rem)] -mb-8 -mr-1 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-2 group-hover:scale-110 md:block"
                >
                  {row.mascot === "coder"    && <Coder className="w-full drop-shadow-md" />}
                  {row.mascot === "marketer" && <Marketer className="w-full drop-shadow-md" />}
                  {row.mascot === "maker"    && <Maker className="w-full drop-shadow-md" />}
                  {row.mascot === "designer" && <Designer className="w-full drop-shadow-md" />}
                </span>
              </div>
            </div>

            {/* Bottom accent bar: grows left-to-right on hover */}
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-[3px] origin-left scale-x-0 bg-black/18 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
            />
          </div>
        ))}
      </div>

      {/* ── 4. CTA block ─────────────────────────────────────────────────── */}
      <div
        data-rs-cta
        className="relative mx-3 mb-3 mt-3 overflow-hidden rounded-[2rem] sm:mx-5 md:mx-6 md:rounded-[2.5rem]"
        style={{ background: "#1e2019" }}
      >
        {/* Giant ghost text — editorial depth layer */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 select-none text-center text-[clamp(8rem,22vw,20rem)] font-semibold leading-none tracking-tight text-white/[0.025]"
        >
          GO
        </span>

        <div className="relative flex flex-col items-center px-6 pb-52 pt-16 text-center md:pb-36 md:pt-24">
          <p className="max-w-lg text-[clamp(1.05rem,0.95rem+0.5vw,1.35rem)] leading-relaxed text-white/50">
            No fees. No prerequisites. Just show up ready to build something that matters.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <LiquidButton
              href="/#contact"
              variant="outline"
              className="border-white/25 px-9 py-4 text-sm"
            >
              Join a workshop <span aria-hidden>→</span>
            </LiquidButton>
            <LiquidButton
              href="/learn-together#explore"
              variant="solid"
              className="px-9 py-4 text-sm"
            >
              Explore tracks <span aria-hidden>↗</span>
            </LiquidButton>
          </div>
        </div>

        {/* Mascots flanking the CTA from the bottom */}
        <span
          data-rs-mascot
          aria-hidden
          className="pointer-events-none absolute -bottom-4 left-[1%] w-[clamp(7rem,16vw,14rem)] -rotate-6"
        >
          <Designer className="w-full drop-shadow-xl" />
        </span>
        <span
          data-rs-mascot
          aria-hidden
          className="pointer-events-none absolute -bottom-4 right-[1%] w-[clamp(7rem,16vw,14rem)] rotate-6"
        >
          <Marketer className="w-full drop-shadow-xl" />
        </span>
      </div>

      {/* Bottom spacer so the section doesn't flush into the footer */}
      <div className="h-6 md:h-8" />
    </section>
  );
}
