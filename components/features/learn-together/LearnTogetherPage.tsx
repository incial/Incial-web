"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Footer, Header, MenuFrame } from "@/components/layout";
import { LT_COLORS } from "./content";
import { useSmoothScroll } from "./useSmoothScroll";
import HeroSection from "./HeroSection";
import CuriositySection from "./CuriositySection";
import ExploreSection from "./ExploreSection";
import BuildingSection from "./BuildingSection";
import JourneySection from "./JourneySection";
import ApproachSection from "./ApproachSection";
import ReadySection from "./ReadySection";
import EventsSection from "./EventsSection";
import GalleryColumns from "./GalleryColumns";
import StatsSection from "./StatsSection";
import TestimonialsSection from "./TestimonialsSection";
import CommunitySection from "./CommunitySection";
import { useLearnTogetherContent } from "./useLearnTogetherContent";

/**
 * LearnTogether: a playful, colourful page on warm paper, unlike the black-and-white pages, but
 * with the site's header and menu, type, hairline boxes and buttons. Every section animates with
 * GSAP ScrollTrigger on top of Lenis smooth scrolling; the same layout serves phones (pinned and
 * sideways effects turn into simple reveals there).
 */
export default function LearnTogetherPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useSmoothScroll();
  // jumps the page to a scroll position (the gallery's scrollbar), through Lenis when it runs
  const scrollTo = useCallback(
    (y: number) => {
      const lenis = lenisRef.current;
      if (lenis) {
        // sections that loaded after Lenis started change the page height: measure again first
        lenis.resize();
        lenis.scrollTo(y, { immediate: true, force: true });
      }
      else window.scrollTo(0, y);
    },
    [lenisRef],
  );
  // the admin-edited parts (events, gallery, testimonials, numbers, community); each shows once it has entries
  const content = useLearnTogetherContent();

  // every character on the page looks toward the pointer: its position (-1..1 on each axis)
  // goes into two CSS variables the pupils read, once per frame at most
  useEffect(() => {
    const root = document.documentElement;
    let frame = 0;
    const onMove = (event: PointerEvent) => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.style.setProperty("--lt-look-x", ((event.clientX / window.innerWidth) * 2 - 1).toFixed(3));
        root.style.setProperty("--lt-look-y", ((event.clientY / window.innerHeight) * 2 - 1).toFixed(3));
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(frame);
      root.style.removeProperty("--lt-look-x");
      root.style.removeProperty("--lt-look-y");
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((open) => !open)} blend />
      <MenuFrame open={menuOpen} />

      <motion.div
        animate={{ y: menuOpen ? 100 : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => menuOpen && setMenuOpen(false)}
        className={`relative origin-top overflow-x-clip text-[#151716] ${menuOpen ? "cursor-pointer" : ""}`}
        style={{ zIndex: 30, background: LT_COLORS.paper }}
      >
        <main>
          <HeroSection />
          <CuriositySection />
          <ExploreSection />
          <BuildingSection />
          <JourneySection />
          <ApproachSection />
          {content && content.stats.length > 0 && <StatsSection stats={content.stats} />}
          {content && content.events.length > 0 && <EventsSection events={content.events} />}
          {content && content.gallery.length > 0 && <GalleryColumns photos={content.gallery} onScrollTo={scrollTo} />}
          {content && content.testimonials.length > 0 && <TestimonialsSection items={content.testimonials} layout={content.testimonialLayout} />}
          {content && content.community.title && <CommunitySection community={content.community} />}
          <ReadySection />
        </main>

        <div className="bg-black pb-4 pt-8 text-white">
          <div className="mx-auto max-w-[1431px] px-5 sm:px-8 lg:px-12">
            <Footer />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
