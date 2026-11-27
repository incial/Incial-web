"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { EXPLORE, LT_COLORS } from "./content";
import { SwapMascot } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/**
 * What We Explore. Desktop: a black band with rounded corners, inset from the page edges, that
 * holds while the four tracks slide past sideways as big coloured cards, each with its mascot
 * (click it to swap). Phones: the cards stack and rise in.
 */
export default function ExploreSection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    const track = root.querySelector<HTMLElement>("[data-track]");
    if (!track) return;

    if (!isDesktop) {
      gsap.utils.toArray<HTMLElement>("[data-card]").forEach((card) => {
        gsap.from(card, { y: 60, rotate: 3, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: card, start: "top 90%" } });
      });
      return;
    }

    const distance = () => track.scrollWidth - track.clientWidth;
    gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: root,
        start: "top top",
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
    gsap.from("[data-card]", {
      yPercent: 16,
      rotate: (i) => (i % 2 ? 4 : -4),
      ease: "power2.out",
      stagger: 0.1,
      scrollTrigger: { trigger: root, start: "top 80%", end: "top top", scrub: 1 },
    });
  });

  return (
    <section ref={ref} id="explore" className="relative px-3 py-3 md:h-[100svh] md:px-4 md:py-4">
      <div
        className="relative h-full overflow-hidden rounded-[2.5rem] py-16 text-[#fffbe8] md:flex md:items-center md:rounded-[3.5rem] md:py-0"
        style={{ background: LT_COLORS.ink }}
      >
        <div data-track className="flex flex-col gap-6 px-5 sm:px-8 md:w-full md:flex-row md:items-center md:gap-7 md:px-[5vw]">
          <div className="md:w-[28vw] md:shrink-0 md:pr-4">
            <h2 className="text-[clamp(2.8rem,1.6rem+5vw,7rem)] font-semibold leading-[1] tracking-[-0.05em]">
              What We <em className="text-[#b8ef5a]">Explore</em>
            </h2>
            <p className="mt-5 max-w-xs text-white/55">Four tracks. Tap a mascot to meet the rest of the crew.</p>
          </div>

          {EXPLORE.map((item, index) => (
            // GSAP moves the wrapper; the card inside lifts and leans on hover
            <div key={item.title} data-card className="md:h-[66svh] md:w-[min(30vw,27rem)] md:shrink-0">
              <article
                className="group relative flex h-full min-h-[26rem] flex-col overflow-hidden rounded-[1.75rem] p-7 text-[#151716] transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-2 hover:rotate-[-1.2deg] md:p-8"
                style={{ background: item.color }}
              >
                <span className="text-sm font-medium tabular-nums text-black/55">{String(index + 1).padStart(2, "0")} / 04</span>
                {/* the mascot, centred, with a soft halo */}
                <div className="relative flex flex-1 items-center justify-center py-4">
                  <span aria-hidden className="absolute aspect-square w-[62%] rounded-full bg-white/30" />
                  <SwapMascot start={item.character} label={`Switch the ${item.title} character`} className="relative w-[68%]" />
                </div>
                <div>
                  <h3 className="text-[clamp(2rem,1.3rem+2.2vw,3.4rem)] font-semibold leading-[1] tracking-[-0.045em]">{item.title}</h3>
                  <p className="mt-3 max-w-[22rem] text-[clamp(0.95rem,0.9rem+0.25vw,1.1rem)] leading-snug text-black/70">{item.text}</p>
                </div>
              </article>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
