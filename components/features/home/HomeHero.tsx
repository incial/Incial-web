"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, type Variants } from "framer-motion";
import GlassTorus from "@/components/ui/GlassTorus";
import LiquidButton from "@/components/ui/LiquidButton";
import ScrollHint from "@/components/ui/ScrollHint";
import ShaderBackground from "@/components/ui/ShaderBackground";
import { useDevice } from "@/hooks";
import GlassTiles from "./GlassTiles";
import LogoScreen from "./LogoScreen";

const EASE = [0.22, 1, 0.36, 1] as const;


const HEADING: Variants = {
  hidden: { opacity: 0, y: 40, filter: "blur(12px)" },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 1.2, ease: EASE },
  },
};
const FOLLOW = (delay: number): Variants => ({
  hidden: { opacity: 0, y: 20 },
  shown: { opacity: 1, y: 0, transition: { delay, duration: 1, ease: EASE } },
});

/** Scrolls to a section of this page without putting it in the address (a reload then still plays the intro). */
function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** How long the page must be still before the scroll hint comes back. */
const SCROLL_IDLE_MS = 900;

/**
 * Whether the scroll hint should show: the page is still (any scrolling hides it until it has
 * been still for a moment), and the hero's headline has not yet scrolled up past the middle of
 * the screen (after that, the hint has nothing left to point to).
 */
function useShowScrollHint(headlineId: string): boolean {
  const [isScrolling, setIsScrolling] = useState(false);
  const [isPastHero, setIsPastHero] = useState(false);
  useEffect(() => {
    let timer = 0;
    const onScroll = () => {
      setIsScrolling(true);
      const headline = document.getElementById(headlineId);
      setIsPastHero(headline ? headline.getBoundingClientRect().top < window.innerHeight * 0.5 : false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIsScrolling(false), SCROLL_IDLE_MS);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(timer);
    };
  }, [headlineId]);
  return !isScrolling && !isPastHero;
}

/**
 * The hero, on the light shader surface used by the page banners. First screen: the main Incial
 * logo drawing itself in, with About Us and Our Works on either side, the glass twist picture in
 * opposite corners, and glass tiles that appear around the pointer. Right below: "We build brand, business, and
 * beyond." in the large light lettering of the site's statements, with an interactive glass pill
 * set between its words, the copy and the two liquid buttons. As its end scrolls away, the bottom edge rounds into the banners' wide
 * curve over the black below. `play` starts the logo once the intro has lifted.
 */
export default function HomeHero({ play }: { play: boolean }) {
  const { isMobile } = useDevice();
  const surfaceRef = useRef<HTMLElement>(null);
  const showHint = useShowScrollHint("hero-headline");
  // as its end scrolls up, the bottom edge rounds into the same wide curve as the page banners
  const { scrollYProgress } = useScroll({
    target: surfaceRef,
    offset: ["end end", "end start"],
  });
  const curve = useTransform(scrollYProgress, (progress) => {
    const amount = Math.min(1, Math.max(0, progress / 0.35));
    // capped by the width too, so narrow phones get a gentle curve rather than a bowl
    return `min(${14 * amount}dvh, ${16 * amount}vw)`;
  });

  return (
    <div className="relative z-10">
      <motion.section
        ref={surfaceRef}
        id="top"
        data-tone="light"
        style={{ ["--hero-curve" as string]: curve }}
        className="stage-light relative isolate overflow-hidden bg-[#f3f6fb] text-[#151716] [border-bottom-left-radius:50%_var(--hero-curve)] [border-bottom-right-radius:50%_var(--hero-curve)]"
      >
        {/* the same shader surface as the page banners, in its light tone */}
        <ShaderBackground
          variant="light"
          className="absolute inset-0 -z-10 h-full w-full"
        />

        {/* ── first screen: the main logo, with the full-background interactive glass tile grid ── */}
        <div className="relative h-[100svh] min-h-[32rem]">
          <GlassTiles className="absolute inset-0 h-full overflow-hidden" />
          {play && (
            // only the logo's buttons take the pointer, so the tiles behind still answer it
            <div className="pointer-events-none absolute inset-0 [&_a]:pointer-events-auto [&_button]:pointer-events-auto">
              <LogoScreen sizeMode={isMobile ? "mobile" : "desktop"} />
              {/* the scroll hint stays put at the bottom of the screen while in the hero, shows only
                  while the page is still (any scrolling hides it), and is gone past the hero */}
              <motion.div
                initial={false}
                animate={{ opacity: showHint ? 1 : 0, y: showHint ? 0 : 10 }}
                transition={{ duration: 0.35, ease: EASE }}
                className={`fixed bottom-[clamp(1rem,3.5dvh,2.25rem)] left-1/2 z-20 -translate-x-1/2 ${showHint ? "" : "pointer-events-none"}`}
              >
                <ScrollHint iconOnly delay={3.4} targetId="hero-headline" />
              </motion.div>
            </div>
          )}
        </div>

        {/* ── the headline, the copy and the buttons ── */}
        <div className="relative">
          <motion.div
            id="hero-headline"
            initial="hidden"
            whileInView="shown"
            viewport={{ once: true, margin: "-15%" }}
            className="relative z-10 mx-auto flex max-w-[1360px] scroll-mt-24 flex-col items-center px-6 pb-[clamp(1.5rem,3vw,2.5rem)] pt-[clamp(1rem,3vw,2.5rem)] text-center"
          >
            <motion.h1
              variants={HEADING}
              className="max-w-[16ch] text-balance font-normal leading-[1.06] tracking-[-0.045em] md:max-w-[24ch]"
              style={{ fontSize: "clamp(2.15rem, 1rem + 5.4vw, 6.5rem)" }}
            >
              <span className="block lg:whitespace-nowrap">We build brand,</span>
              <span className="block lg:whitespace-nowrap">business and beyond.</span>
            </motion.h1>

            <motion.p
              variants={FOLLOW(0.35)}
              className="mt-[clamp(1rem,2.4vw,1.75rem)] max-w-[36rem] text-[clamp(0.95rem,0.85rem+0.4vw,1.15rem)] leading-relaxed text-black/55"
            >
              <span className="text-black/80">
                Technology, branding, marketing and media.
              </span>{" "}
              Everything a business needs to grow, under one roof.
            </motion.p>

            <motion.div
              variants={FOLLOW(0.5)}
              className="mt-[clamp(1.5rem,3vw,2.25rem)] flex flex-wrap justify-center gap-3"
            >
              <LiquidButton
                onClick={() => scrollToSection("contact")}
                variant="ink"
                className="px-8 py-4 text-sm"
              >
                Start a project <span aria-hidden>→</span>
              </LiquidButton>
              <LiquidButton
                onClick={() => scrollToSection("services")}
                variant="outline"
                className="px-8 py-4 text-sm"
              >
                See what we do
              </LiquidButton>
            </motion.div>
          </motion.div>
          {/* large 3D glass torus positioned on the white band so only its upper arc is visible above the curved black edge */}
          <div className="relative z-0 h-[calc(min(14dvh,16vw)+clamp(13rem,22vw,18rem))] w-full">
            <div className="absolute left-1/2 -top-[clamp(3rem,7vw,6.5rem)] h-[clamp(26rem,68vw,58rem)] w-[clamp(26rem,68vw,58rem)] -translate-x-1/2">
              <GlassTorus
                bladeCount={isMobile ? 32 : 56}
                speed={0.45}
                className="h-full w-full"
              />
            </div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
