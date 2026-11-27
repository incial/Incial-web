"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import Link from "next/link";
import LiquidButton from "@/components/ui/LiquidButton";
import { INTRO, INTRO_TAGLINE, JOIN_POINTS, LT_COLORS } from "./content";
import { SwapMascot } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

// the statement, word by word; "create" is drawn in the green gradient
const STATEMENT = `${INTRO} ${INTRO_TAGLINE}`.split(/\s+/);
const HIGHLIGHT = "create";
const GLYPHS = "!|K<>/\\~_=+*#%";
const GLYPH_COUNT = 5;
const GLYPH_MS = 70;

/** A short trail of scrambling characters in green (as after GSAP's "Delivering"). */
function ScrambleTrail() {
  const [text, setText] = useState("!|K~—");
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = setInterval(() => {
      let next = "";
      for (let i = 0; i < GLYPH_COUNT; i++) next += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
      setText(next);
    }, GLYPH_MS);
    return () => clearInterval(timer);
  }, []);
  return (
    <span aria-hidden className="ml-[0.3em] inline-block font-mono text-[0.62em] font-bold tracking-[0.04em] text-[#2bd46a]">
      {text}
    </span>
  );
}

const CARDS = [
  { title: JOIN_POINTS[0], note: "Hands-on sessions where you make something from the first hour.", color: LT_COLORS.sun, start: "designer" },
  { title: JOIN_POINTS[1], note: "Learn alongside designers, coders and marketers who build like you.", color: LT_COLORS.lilac, start: "coder" },
  { title: JOIN_POINTS[2], note: "Leave with portfolio-ready work, not just notes.", color: LT_COLORS.blue, start: "maker" },
] as const;

/**
 * The introduction. First, after GSAP's "Why GSAP" section: a braced label and one large
 * statement that types itself out word by word as the reader scrolls (words not reached yet are
 * hidden), "create" in a green gradient, and a scrambling glyph trail at the end. Then three bold
 * cards (after Slush), one per promise, each with its own mascot; they rise in one after another,
 * and on hover a card lifts and tilts and its mascot pops up.
 */
export default function IntroPanel() {
  const ref = useRef<HTMLDivElement>(null);

  useSectionMotion(ref, ({ root }) => {
    // the statement types itself out with the scroll
    gsap.fromTo(
      "[data-type-word]",
      { opacity: 0 },
      {
        opacity: 1,
        ease: "none",
        stagger: 0.08,
        scrollTrigger: { trigger: root.querySelector("[data-statement]"), start: "top 82%", end: "bottom 50%", scrub: 0.4 },
      },
    );
    gsap.from("[data-intro-fade]", { y: 24, opacity: 0, duration: 0.9, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: "[data-intro-fade]", start: "top 90%" } });
    gsap.from("[data-intro-card]", {
      y: 90,
      opacity: 0,
      duration: 1.1,
      ease: EASE_OUT,
      stagger: 0.12,
      scrollTrigger: { trigger: root.querySelector("[data-cards]"), start: "top 85%" },
    });
  });

  return (
    <div ref={ref} className="relative mx-auto max-w-[1431px]">
      <div>
        <p className="flex items-stretch gap-2 text-sm font-semibold text-[#151716]">
          <span aria-hidden className="text-[1.9em] font-light leading-[0.8]">{"{"}</span>
          <span className="self-center">Why LearnTogether</span>
          <span aria-hidden className="text-[1.9em] font-light leading-[0.8]">{"}"}</span>
        </p>
        <p
          data-statement
          className="mt-8 max-w-[64rem] text-[clamp(1.9rem,1.1rem+2.9vw,4.4rem)] font-medium leading-[1.12] tracking-[-0.035em] text-[#151716]"
        >
          <span className="sr-only">{`${INTRO} ${INTRO_TAGLINE}`}</span>
          <span aria-hidden>
            {STATEMENT.map((word, index) => (
              <span key={`${word}-${index}`} data-type-word className="inline">
                {word.toLowerCase().startsWith(HIGHLIGHT) ? (
                  <span className="bg-gradient-to-r from-[#2bd46a] to-[#b8ef5a] bg-clip-text text-transparent">{word}</span>
                ) : (
                  word
                )}
                {index < STATEMENT.length - 1 ? " " : ""}
                {index === STATEMENT.length - 1 && <ScrambleTrail />}
              </span>
            ))}
          </span>
        </p>
        <div data-intro-fade className="mt-10 flex flex-wrap gap-3">
          <LiquidButton href="/learn-together#explore" variant="ink" className="px-7 py-3.5 text-sm">
            Explore Workshops <span aria-hidden>→</span>
          </LiquidButton>
          <Link
            href="/#contact"
            className="rounded-full border border-black/20 bg-white/60 px-7 py-3.5 text-sm font-medium text-[#151716] transition-[background-color,border-color] duration-300 hover:border-black/40 hover:bg-white"
          >
            Join a workshop
          </Link>
        </div>
      </div>

      {/* three posters, after the Boshky mascot sheets: crop marks, a giant number, the mascot */}
      <ul data-cards className="mt-[clamp(4rem,8vw,7rem)] grid grid-cols-1 gap-5 md:grid-cols-3 md:gap-6">
        {CARDS.map(({ title, note, color, start }, index) => (
          <li key={title} data-intro-card className="group">
            <div
              className="relative flex aspect-[4/5] flex-col overflow-hidden rounded-[1.25rem] px-6 pb-11 pt-6 text-[#151716] md:px-8 md:pb-12 md:pt-7"
              style={{ background: color }}
            >
              {/* crop marks in the corners */}
              {["left-4 top-4", "right-4 top-4", "bottom-4 left-4", "bottom-4 right-4"].map((place) => (
                <span key={place} aria-hidden className={`absolute ${place} text-xl font-light leading-none text-black/35`}>+</span>
              ))}
              <span className="relative z-10 mx-auto mt-1 text-xs font-semibold uppercase tracking-[0.24em] text-black/55">
                LearnTogether
              </span>
              {/* the giant number sits behind the mascot */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 top-[12%] select-none text-center text-[clamp(9rem,6rem+9vw,15rem)] font-bold leading-none tracking-[-0.08em] text-white/35"
              >
                {String(index + 1).padStart(2, "0")}
              </span>
              <div className="relative z-10 flex flex-1 items-center justify-center">
                <SwapMascot
                  start={start}
                  label="Switch character"
                  className="w-[66%] transition-transform duration-500 group-hover:-translate-y-2 group-hover:scale-[1.04]"
                />
              </div>
              <div className="relative z-10 flex items-end justify-between gap-4">
                <div>
                  <h3 className="max-w-[14ch] text-[clamp(1.5rem,1.1rem+1.2vw,2.3rem)] font-semibold leading-[1.02] tracking-[-0.04em]">{title}</h3>
                  <p className="mt-2 max-w-[30ch] text-[0.92rem] leading-snug text-black/65">{note}</p>
                </div>
                <Link
                  href="/learn-together#explore"
                  aria-label={`Explore: ${title}`}
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#151716] text-lg text-white transition-transform duration-300 group-hover:-rotate-45"
                >
                  →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
