"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { JOURNEY, LT_COLORS } from "./content";
import { SwapMascot } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

// the path runs left to right through four stops, in a 1000 x 300 box
const PATH = "M10 230 C120 230 140 70 250 70 S390 230 500 230 S640 70 750 70 S880 230 990 230";
const OFFSETS = ["md:mt-40", "md:mt-0", "md:mt-40", "md:mt-0"] as const;

/**
 * "We don't list sessions. We design journeys." Desktop: the section holds while a path draws
 * itself across the screen and each step pops in as the line reaches it. Phones: the steps rise
 * in one after another.
 */
export default function JourneySection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    if (!isDesktop) {
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((step) => {
        gsap.from(step, { y: 50, scale: 0.92, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: step, start: "top 90%" } });
      });
      return;
    }

    const path = root.querySelector<SVGPathElement>("[data-path]");
    const length = path?.getTotalLength() ?? 1500;
    if (path) gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });

    // the heading and steps arrive with the section (no pin, so there is never an empty screen
    // waiting for the scroll); the path draws itself as the section scrolls past
    gsap.from("[data-heading]", { y: 40, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: root, start: "top 80%" } });
    gsap.from("[data-step]", {
      scale: 0.7,
      y: 60,
      rotate: (i) => (i % 2 ? 8 : -8),
      opacity: 0,
      duration: 0.9,
      ease: "back.out(1.6)",
      stagger: 0.12,
      scrollTrigger: { trigger: "[data-steps]", start: "top 85%" },
    });
    if (path) {
      gsap.to(path, { strokeDashoffset: 0, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 85%", end: "bottom 45%", scrub: 0.8 } });
    }
  });

  return (
    <section ref={ref} className="relative">
      <div className="relative flex flex-col overflow-hidden px-5 py-[clamp(3rem,6vw,5rem)] sm:px-8 lg:px-12">
        <div data-heading className="mx-auto flex w-full max-w-[1431px] items-end justify-between gap-6">
          <h2 className="text-[clamp(2.4rem,1.4rem+4vw,5.6rem)] font-semibold leading-[0.95] tracking-[-0.05em] text-[#151716]">
            We Don&apos;t List Sessions.
            <br />
            <em className="text-[#56a6ff]">We Design Journeys.</em>
          </h2>
          <div className="hidden shrink-0 items-end sm:flex">
            <SwapMascot start="marketer" label="Switch character" className="w-[clamp(6rem,10vw,9.5rem)] -rotate-3" />
            <SwapMascot start="designer" label="Switch character" className="-ml-4 w-[clamp(6rem,10vw,9.5rem)] rotate-3" />
          </div>
        </div>

        <div data-steps className="relative mx-auto mt-12 w-full max-w-[1431px] md:mt-16">
          <svg viewBox="0 0 1000 300" preserveAspectRatio="none" aria-hidden className="absolute inset-x-0 top-6 hidden h-[clamp(14rem,30vw,22rem)] w-full md:block">
            <path data-path d={PATH} fill="none" stroke={LT_COLORS.ink} strokeWidth="3" strokeLinecap="round" />
          </svg>
          <ol className="relative grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
            {JOURNEY.map((step, index) => (
              <li key={step.title} data-step className={OFFSETS[index]}>
                <div
                  className="group rounded-[1.75rem] p-6 shadow-[0_24px_50px_-30px_rgba(0,0,0,0.5)] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1.5 hover:rotate-[-1.5deg] md:p-7"
                  style={{ background: step.color }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#151716] text-sm font-semibold text-white transition-transform duration-500 group-hover:rotate-[360deg]">
                    {index + 1}
                  </span>
                  <h3 className="mt-6 text-[clamp(1.6rem,1.2rem+1.2vw,2.4rem)] font-semibold tracking-[-0.04em] text-[#151716]">{step.title}</h3>
                  <p className="mt-2 text-[0.98rem] leading-snug text-black/70">{step.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
