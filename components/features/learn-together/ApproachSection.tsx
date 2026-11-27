"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { APPROACH_TEXT, APPROACH_TRAITS } from "./content";
import { SwapMascot } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/**
 * Our Approach: the heading and the two sentences side by side, then the four principles as tall
 * coloured tiles. On desktop the tiles start as a fanned pile in the middle and deal out into a
 * row as you scroll; on phones they rise in one by one. Each tile has its number, its word, a
 * short line and a mascot that peeks up from the bottom (click it to swap).
 */
export default function ApproachSection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    gsap.from("[data-approach-heading] [data-line]", { yPercent: 110, duration: 1.1, ease: EASE_OUT, stagger: 0.08, scrollTrigger: { trigger: root, start: "top 78%" } });
    gsap.from("[data-approach-text]", { y: 30, opacity: 0, duration: 1, ease: EASE_OUT, stagger: 0.12, scrollTrigger: { trigger: root, start: "top 70%" } });

    const tiles = gsap.utils.toArray<HTMLElement>("[data-tile-card]");
    if (!isDesktop) {
      tiles.forEach((tile) => {
        gsap.from(tile, { y: 60, rotate: 4, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: tile, start: "top 90%" } });
      });
      return;
    }

    // dealt out from a fanned pile at the centre of the row
    const row = root.querySelector<HTMLElement>("[data-tiles]");
    if (!row) return;
    gsap.from(tiles, {
      x: (i, el: HTMLElement) => row.offsetWidth / 2 - (el.offsetLeft + el.offsetWidth / 2),
      y: 60,
      rotate: (i) => APPROACH_TRAITS[i].rotate * 1.6,
      ease: "power2.out",
      stagger: 0.04,
      scrollTrigger: { trigger: row, start: "top 92%", end: "top 35%", scrub: 0.8, invalidateOnRefresh: true },
    });
  });

  return (
    <section ref={ref} id="approach" className="relative py-[clamp(5rem,10vw,9rem)]">
      <div className="mx-auto max-w-[1500px] px-5 sm:px-8 lg:px-12">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_minmax(0,34rem)] md:items-end md:gap-16">
          <h2 data-approach-heading className="text-[clamp(3rem,1.6rem+6vw,8rem)] font-semibold leading-[0.95] tracking-[-0.055em]">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line className="block">Our</span>
            </span>
            <span className="block overflow-hidden pb-[0.16em] pr-[0.1em]">
              <em data-line className="block text-[#ff6b57]">Approach.</em>
            </span>
          </h2>
          <div className="flex flex-col gap-4 text-[clamp(1.02rem,0.94rem+0.35vw,1.25rem)] leading-snug text-black/70">
            {APPROACH_TEXT.map((text) => (
              <p key={text} data-approach-text>
                {text}
              </p>
            ))}
          </div>
        </div>

        <ol data-tiles className="mt-[clamp(3rem,7vw,6rem)] grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {APPROACH_TRAITS.map((trait, index) => (
            <li key={trait.label} data-tile-card>
              <article
                className="group relative flex h-full min-h-[22rem] flex-col overflow-hidden rounded-[2rem] p-7 text-[#151716] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 lg:min-h-[30rem]"
                style={{ background: trait.color }}
              >
                <span className="text-sm font-semibold tabular-nums text-black/45">{String(index + 1).padStart(2, "0")}</span>
                <h3 className="mt-4 text-[clamp(2rem,1.4rem+1.6vw,2.9rem)] font-semibold leading-[0.98] tracking-[-0.045em]">{trait.label}</h3>
                <p className="mt-4 max-w-[17rem] text-[clamp(0.98rem,0.92rem+0.2vw,1.1rem)] leading-snug text-black/70">{trait.note}</p>
                {/* the mascot peeks up from the bottom edge and rises on hover */}
                <div className="pointer-events-none mt-auto flex justify-end">
                  <span className="pointer-events-auto -mb-12 translate-y-3 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0">
                    <SwapMascot start={trait.character} label={`Switch the ${trait.label} character`} className="w-[clamp(8rem,11vw,10.5rem)]" />
                  </span>
                </div>
              </article>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
