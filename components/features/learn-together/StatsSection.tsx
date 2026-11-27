"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { Globe2, Heart, Sparkles, Check } from "lucide-react";
import type { Stat } from "@/lib/dataLoader";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/** Each card's colours and badge, in turn: white with a blue number, then green, coral, lilac. */
const CARD_STYLES = [
  { background: "#ffffff", number: LT_COLORS.blue, text: "#151716", badge: LT_COLORS.blue, badgeInk: "#ffffff", Icon: Globe2 },
  { background: "#8fd463", number: "#ffffff", text: "#ffffff", badge: "#ffffff", badgeInk: "#5cae3a", Icon: Check },
  { background: LT_COLORS.coral, number: "#ffffff", text: "#ffffff", badge: "#ffffff", badgeInk: LT_COLORS.coral, Icon: Heart },
  { background: LT_COLORS.lilac, number: "#151716", text: "#151716", badge: "#151716", badgeInk: LT_COLORS.lilac, Icon: Sparkles },
] as const;

/** How much of each earlier card stays showing above the next one (its top strip). */
const PEEK_REM = 3.25;

/** "12+" → 12 and "+", so the number can count up and keep its ending. */
function splitValue(value: string): { number: number | null; prefix: string; suffix: string } {
  const match = value.match(/^(\D*)(\d+(?:\.\d+)?)(.*)$/);
  return match ? { prefix: match[1], number: Number(match[2]), suffix: match[3] } : { number: null, prefix: "", suffix: "" };
}

/** A hand-drawn wave under a word, drawn on as the heading arrives. */
function Squiggle() {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" className="absolute -bottom-[0.14em] left-0 h-[0.26em] w-full overflow-visible" aria-hidden>
      <path
        data-squiggle
        d="M4 14 Q 22 2 40 14 T 76 14 T 112 14 T 148 14 T 184 14 T 220 14 T 256 14 T 296 14"
        fill="none"
        stroke={LT_COLORS.lilac}
        strokeWidth="7"
        strokeLinecap="round"
        pathLength={1}
      />
    </svg>
  );
}

/**
 * The numbers, laid out like MindMarket's: the heading and a short note hold on the left while,
 * on the right, one tall card per number slides up and stacks over the one before (leaving its top
 * strip showing). Each number counts up as its card arrives. Plain CSS sticky does the stacking,
 * so it stays smooth and works the same on phones.
 */
export default function StatsSection({ stats }: { stats: Stat[] }) {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    gsap.from("[data-stats-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 75%" } });
    gsap.fromTo("[data-squiggle]", { strokeDasharray: "1 1", strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.2, ease: "power2.inOut", delay: 0.5, scrollTrigger: { trigger: root, start: "top 75%" } });
    gsap.from("[data-stats-note]", { y: 30, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: root, start: "top 60%" } });
    gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
      const { number, prefix, suffix } = splitValue(el.dataset.count ?? "");
      if (number === null) return;
      const decimals = String(number).includes(".") ? 1 : 0;
      const counter = { value: 0 };
      gsap.to(counter, {
        value: number,
        duration: 1.6,
        ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%" },
        onUpdate: () => {
          el.textContent = `${prefix}${counter.value.toFixed(decimals)}${suffix}`;
        },
      });
    });
  });

  return (
    <section ref={ref} id="numbers" className="relative pt-[clamp(5rem,10vw,9rem)]">
      <div className="mx-auto grid max-w-[1500px] gap-12 px-5 sm:px-8 md:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] md:gap-16 lg:px-12">
        {/* left: holds while the cards stack */}
        <div className="md:sticky md:top-[clamp(6rem,14vh,9rem)] md:flex md:h-[min(70svh,40rem)] md:flex-col md:justify-between md:self-start">
          <h2 data-stats-heading className="text-[clamp(2.6rem,1.4rem+4.4vw,5.6rem)] font-semibold leading-[1] tracking-[-0.05em]">
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-line className="block">A few numbers</span>
            </span>
            <span className="block overflow-hidden pb-[0.22em]">
              <span data-line className="block">
                behind every{" "}
                <span className="relative inline-block">
                  session
                  <Squiggle />
                </span>
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-line className="block">we run</span>
            </span>
          </h2>
          <p data-stats-note className="mt-8 max-w-[24rem] text-[clamp(1rem,0.94rem+0.25vw,1.15rem)] leading-snug text-black/70 md:mt-0">
            These numbers are more than milestones. They are the people who showed up, the things they built, and a community that keeps growing.
          </p>
        </div>

        {/* right: the cards, each sticking a little lower than the one before */}
        <ol className="pb-[clamp(4rem,10vw,8rem)]">
          {stats.map((stat, index) => {
            const style = CARD_STYLES[index % CARD_STYLES.length];
            const { Icon } = style;
            return (
              <li
                key={stat.id}
                className="sticky mb-[clamp(2rem,8vh,5rem)] last:mb-0"
                style={{ top: `calc(clamp(6rem,14vh,9rem) + ${index * PEEK_REM}rem)` }}
              >
                <article
                  className="relative flex h-[clamp(22rem,58svh,32rem)] flex-col justify-between overflow-hidden rounded-[2.25rem] p-7 shadow-[0_-18px_40px_-30px_rgba(0,0,0,0.35)] md:p-9"
                  style={{ background: style.background, color: style.text }}
                >
                  <span className="absolute right-6 top-6 flex h-14 w-14 items-center justify-center rounded-full md:right-8 md:top-8 md:h-16 md:w-16" style={{ background: style.badge, color: style.badgeInk }}>
                    <Icon size={28} strokeWidth={2.2} aria-hidden />
                  </span>
                  <span
                    data-count={stat.value}
                    className="mt-10 block text-[clamp(5rem,3rem+7vw,9.5rem)] font-medium leading-[0.9] tracking-[-0.06em] tabular-nums"
                    style={{ color: style.number }}
                  >
                    {stat.value}
                  </span>
                  <p className="max-w-[22rem] text-[clamp(1.05rem,0.95rem+0.4vw,1.3rem)] font-medium leading-snug">{stat.label}</p>
                </article>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
