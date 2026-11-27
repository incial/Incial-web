"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { CURIOSITY_LINES, LT_COLORS } from "./content";
import { Peeker } from "./Characters";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

const STICKERS = [
  { color: LT_COLORS.lime, rotate: -6, place: "md:left-[6%] md:top-[18%]" },
  { color: LT_COLORS.lilac, rotate: 5, place: "md:right-[7%] md:top-[30%]" },
  { color: LT_COLORS.sun, rotate: -3, place: "md:bottom-[14%] md:left-[28%]" },
] as const;

const WORD = "Curiosity.";
const GLYPHS = "!<>-_\\/[]{}=+*^?#%&@$";
/** How big "Curiosity." is drawn on desktop as the section arrives (it grows to full size after). */
const WORD_SCALE_DESKTOP = 0.45;

/** The word with letters still to resolve shown as random glyphs. */
function scrambled(progress: number): string {
  const resolved = Math.floor(progress * WORD.length);
  return WORD.split("")
    .map((char, i) => (i < resolved ? char : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
    .join("");
}

/**
 * "It started with Curiosity." As the section scrolls in, "Curiosity." scrambles into place. On
 * desktop the section then holds while the word grows to fill the screen and the three lines land
 * around it as tilted stickers; on phones the same pieces simply reveal as they scroll in.
 */
export default function CuriositySection() {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ isDesktop, root }) => {
    const word = root.querySelector<HTMLElement>("[data-word]");
    if (!word) return;

    // the word scrambles into place as the section arrives
    const scramble = { progress: 0 };
    const drawWord = () => {
      word.textContent = scramble.progress >= 1 ? WORD : scrambled(scramble.progress);
    };
    gsap.fromTo(
      scramble,
      { progress: 0 },
      {
        progress: 1,
        ease: "none",
        onUpdate: drawWord,
        onStart: drawWord,
        scrollTrigger: { trigger: root, start: isDesktop ? "top 60%" : "top 85%", end: isDesktop ? "top top" : "top 35%", scrub: 0.6 },
      },
    );
    const cleanup = () => {
      word.textContent = WORD;
    };

    if (!isDesktop) {
      gsap.from("[data-big]", { scale: 0.6, opacity: 0, duration: 1.2, ease: EASE_OUT, scrollTrigger: { trigger: "[data-big]", start: "top 85%" } });
      gsap.from("[data-peeker]", { yPercent: 100, duration: 1.2, ease: EASE_OUT, scrollTrigger: { trigger: "[data-big]", start: "top 80%" } });
      gsap.utils.toArray<HTMLElement>("[data-sticker]").forEach((sticker) => {
        gsap.from(sticker, { y: 40, rotate: 0, opacity: 0, duration: 1, ease: EASE_OUT, scrollTrigger: { trigger: sticker, start: "top 90%" } });
      });
      return cleanup;
    }

    // on the way in (before the pin): the words rise and "Curiosity." starts growing, so the
    // gap above the section is never an empty screen
    const approach = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 95%", end: "top top", scrub: 0.6 },
      defaults: { ease: "none" },
    });
    approach
      .fromTo("[data-small]", { y: 60, opacity: 0 }, { y: 0, opacity: 1 }, 0)
      .fromTo("[data-big]", { scale: 0.2, y: 120, opacity: 0, rotate: -6 }, { scale: WORD_SCALE_DESKTOP, y: 0, opacity: 1, rotate: 0 }, 0)
      .fromTo("[data-peeker]", { yPercent: 100 }, { yPercent: 35 }, 0.3);

    const timeline = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top top", end: "+=160%", scrub: 0.8, pin: "[data-stage]" },
    });
    timeline
      .fromTo("[data-big]", { scale: WORD_SCALE_DESKTOP }, { scale: 1, ease: "power2.out", duration: 1, immediateRender: false })
      .fromTo("[data-peeker]", { yPercent: 35 }, { yPercent: 0, ease: "back.out(1.4)", duration: 0.6, immediateRender: false }, 0.25)
      .from("[data-sticker]", { scale: 0, rotate: 0, opacity: 0, ease: "back.out(2)", duration: 0.45, stagger: 0.35 }, 0.55)
      .to("[data-big]", { color: LT_COLORS.coral, duration: 0.4 }, 1.5)
      .to({}, { duration: 0.3 });
    return cleanup;
  });

  return (
    <section ref={ref} className="relative">
      <div
        data-stage
        className="relative flex flex-col items-center justify-center overflow-hidden px-5 pb-0 pt-16 sm:px-8 md:min-h-[100svh] md:py-24"
      >
        <p data-small className="text-[clamp(1.1rem,0.9rem+1vw,1.8rem)] font-medium tracking-[-0.02em] text-black/55">
          It started with
        </p>
        <h2
          data-big
          aria-label={WORD}
          className="origin-center text-center text-[clamp(3.6rem,15vw,15rem)] font-semibold italic leading-[0.95] tracking-[-0.06em] text-[#151716]"
        >
          <span data-word aria-hidden className="inline-block whitespace-nowrap">
            {WORD}
          </span>
        </h2>

        {/* a curious character peeks up from the bottom edge */}
        <div data-peeker aria-hidden className="pointer-events-none absolute bottom-0 left-1/2 w-[min(40vw,15rem)] -translate-x-1/2">
          <Peeker className="w-full" />
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 pb-[clamp(9rem,42vw,12rem)] md:static md:mt-0 md:gap-4 md:pb-0">
          {CURIOSITY_LINES.map((line, index) => {
            const sticker = STICKERS[index];
            return (
              <span
                key={line}
                data-sticker
                className={`rounded-full px-5 py-2.5 text-[clamp(0.95rem,0.85rem+0.6vw,1.4rem)] font-medium text-[#151716] shadow-[0_18px_40px_-18px_rgba(0,0,0,0.45)] md:absolute md:px-6 md:py-3 ${sticker.place}`}
                style={{ background: sticker.color, rotate: `${sticker.rotate}deg` }}
              >
                {line}
              </span>
            );
          })}
        </div>
      </div>
    </section>
  );
}
