"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import LiquidButton from "@/components/ui/LiquidButton";
import type { LearnTogetherCommunity } from "@/lib/dataLoader";
import { SwapMascot } from "./Characters";
import { LT_COLORS } from "./content";
import { EASE_OUT, useSectionMotion } from "./useSectionMotion";

/** The invitation to join the community: a lime band with a big line, a short note and the button. */
export default function CommunitySection({ community }: { community: LearnTogetherCommunity }) {
  const ref = useRef<HTMLElement>(null);

  useSectionMotion(ref, ({ root }) => {
    gsap.from("[data-community-card]", { y: 80, scale: 0.96, opacity: 0, duration: 1.1, ease: EASE_OUT, scrollTrigger: { trigger: root, start: "top 85%" } });
    gsap.from("[data-community-mascot]", { yPercent: 60, rotate: 0, opacity: 0, duration: 1.1, ease: "back.out(1.6)", stagger: 0.12, scrollTrigger: { trigger: root, start: "top 75%" } });
  });

  return (
    <section ref={ref} id="community" className="relative px-3 pb-[clamp(3rem,6vw,5rem)] sm:px-5 md:px-6">
      <div
        data-community-card
        className="relative mx-auto flex max-w-[1500px] flex-col items-start gap-6 overflow-hidden rounded-[2rem] px-7 py-12 md:rounded-[2.5rem] md:px-14 md:py-16 lg:flex-row lg:items-center lg:justify-between"
        style={{ background: LT_COLORS.lime }}
      >
        <div className="relative z-10 max-w-[44rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-black/45">Join Community</p>
          <h2 className="mt-4 text-[clamp(2.2rem,1.3rem+3.6vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.05em]">{community.title}</h2>
          {community.text && <p className="mt-4 max-w-[34rem] text-[clamp(1rem,0.92rem+0.35vw,1.2rem)] leading-snug text-black/65">{community.text}</p>}
          {community.url && (
            <LiquidButton href={community.url} variant="ink" className="mt-8 px-8 py-4 text-sm">
              {community.buttonLabel || "Join the community"} <span aria-hidden>→</span>
            </LiquidButton>
          )}
        </div>

        <div className="relative z-10 flex items-end self-center lg:self-end">
          <span data-community-mascot className="-rotate-6">
            <SwapMascot start="designer" label="Switch character" className="w-[clamp(7.5rem,14vw,11rem)]" />
          </span>
          <span data-community-mascot className="-ml-6 rotate-6">
            <SwapMascot start="marketer" label="Switch character" className="w-[clamp(7.5rem,14vw,11rem)]" />
          </span>
        </div>
      </div>
    </section>
  );
}
