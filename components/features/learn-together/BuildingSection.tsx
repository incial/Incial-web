"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { BUILDING_ROLES, LT_COLORS } from "./content";
import { SwapMascot } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

const ROLE_COLORS = [LT_COLORS.lime, LT_COLORS.blue, LT_COLORS.coral] as const;

function Cross({ className }: { className: string }) {
  return <span aria-hidden className={`pointer-events-none absolute select-none text-lg leading-none text-[#56a6ff] ${className}`}>+</span>;
}

/**
 * "It's not just teaching. It's about building." In the site's hairline-box pattern: the lines
 * draw in as the section arrives, and each of the three roles is a row that fills with colour
 * on hover.
 */
export default function BuildingSection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    const timeline = gsap.timeline({ scrollTrigger: { trigger: root, start: "top 70%" }, defaults: { ease: EASE_OUT } });
    timeline
      .from("[data-rule-x]", { scaleX: 0, transformOrigin: "left center", duration: 1.4, stagger: 0.1 })
      .from("[data-rule-y]", { scaleY: 0, transformOrigin: "center top", duration: 1.2 }, 0.2)
      .from("[data-rise]", { yPercent: 110, duration: 1.1, stagger: 0.08 }, 0.3)
      .from("[data-role]", { x: -30, opacity: 0, duration: 0.9, stagger: 0.1 }, 0.6);
  });

  return (
    <section ref={ref} className="px-5 pb-[clamp(3rem,6vw,5rem)] pt-[clamp(6rem,13vw,12rem)] sm:px-8 lg:px-12">
      <div className="relative mx-auto grid max-w-[1431px] grid-cols-1 md:grid-cols-2">
        <span data-rule-x aria-hidden className="absolute inset-x-0 top-0 h-px bg-black/15" />
        <span data-rule-x aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-black/15" />
        <span data-rule-y aria-hidden className="absolute inset-y-0 left-1/2 hidden w-px bg-black/15 md:block" />
        <Cross className="-left-2 -top-2.5" />
        <Cross className="-right-2 -top-2.5" />
        <Cross className="-bottom-2.5 -left-2" />
        <Cross className="-bottom-2.5 -right-2" />
        <Cross className="-top-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />
        <Cross className="-bottom-2.5 left-1/2 hidden -translate-x-1/2 md:inline" />

        <div className="flex flex-col justify-between gap-12 py-12 md:py-20 md:pr-16">
          <h2 className="text-[clamp(3rem,1.6rem+5.2vw,7.6rem)] font-semibold leading-[1] tracking-[-0.05em] text-[#151716]">
            <span className="block overflow-hidden pb-[0.22em] -mb-[0.16em] pr-[0.14em] -mr-[0.14em]"><span data-rise className="block">It&apos;s Not Just</span></span>
            <span className="block overflow-hidden pb-[0.22em] -mb-[0.16em] pr-[0.14em] -mr-[0.14em]"><span data-rise className="block italic text-black/35">Teaching</span></span>
          </h2>
          <div className="flex items-end justify-center md:justify-start">
            <SwapMascot start="coder" label="Switch character" className="w-[clamp(9.5rem,40vw,11rem)] -rotate-3 md:w-[clamp(7rem,12vw,11rem)]" />
            <SwapMascot start="maker" label="Switch character" className="-ml-5 w-[clamp(9.5rem,40vw,11rem)] rotate-3 md:w-[clamp(7rem,12vw,11rem)]" />
          </div>
          <p className="max-w-md text-[clamp(1.1rem,0.98rem+0.45vw,1.45rem)] leading-relaxed text-black/60">
            Students don&apos;t just consume knowledge, they create with it.
          </p>
        </div>

        <div className="flex flex-col gap-10 border-t border-black/15 py-12 md:border-t-0 md:py-20 md:pl-16">
          <h3 className="text-[clamp(2.4rem,1.4rem+3.6vw,5.4rem)] font-semibold leading-[1] tracking-[-0.045em] text-[#151716]">
            <span className="block overflow-hidden pb-[0.22em] -mb-[0.16em] pr-[0.14em] -mr-[0.14em]"><span data-rise className="block">It&apos;s about <em className="text-[#56a6ff]">building.</em></span></span>
          </h3>
          <div>
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.18em] text-black/45">LearnTogether is designed as</p>
            <ul className="border-t border-black/15">
              {BUILDING_ROLES.map((role, index) => (
                <li
                  key={role}
                  data-role
                  className="group relative flex items-center justify-between overflow-hidden border-b border-black/15 px-2 py-7 md:py-8"
                >
                  <span
                    aria-hidden
                    className="absolute inset-0 origin-left scale-x-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100"
                    style={{ background: ROLE_COLORS[index] }}
                  />
                  <span className="relative text-[clamp(1.4rem,1.05rem+1.2vw,2.4rem)] font-medium tracking-[-0.03em] text-[#151716] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-3">
                    {role}
                  </span>
                  <span className="relative text-sm tabular-nums text-black/40 transition-colors duration-500 group-hover:text-black/70">
                    0{index + 1}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
