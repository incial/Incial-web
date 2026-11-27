"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Header, MenuFrame } from "@/components/layout";
import HomeClients from "./HomeClients";
import HomeContact from "./HomeContact";
import HomeEditorialThesis from "./HomeEditorialThesis";
import HomeFutureNetwork from "./HomeFutureNetwork";
import HomeGlobalPresence from "./HomeGlobalPresence";
import HomeHero from "./HomeHero";
import HomeIntro from "./HomeIntro";
import HomeStatement from "./HomeStatement";
import HomeTestimonials from "./HomeTestimonials";

/** The open menu bar is black on the home page (and its frame with it). */
const MENU_TONE = { "--stage-menu-bg": "#000000", "--stage-menu-ink": "#ffffff", "--stage-frame": "#000000" } as React.CSSProperties;
/** Where the header sits: the section under this line decides its ink. */
const HEADER_LINE_PX = 40;

/** True when the section under the header is a dark one (marked data-tone="dark"). */
function isDarkUnderHeader(): boolean {
  const sections = document.querySelectorAll<HTMLElement>("[data-tone]");
  for (const section of sections) {
    const { top, bottom } = section.getBoundingClientRect();
    if (top <= HEADER_LINE_PX && bottom > HEADER_LINE_PX) return section.dataset.tone === "dark";
  }
  return false;
}

/**
 * The home page: the intro on black (the words and the rising globe over the shader), the light
 * logo hero (its bottom curving away as it scrolls), the editorial client introduction, the black
 * statement that lights up as it scrolls, the remaining services detail, and contact. A link
 * straight to a section (e.g. /#contact) skips the intro.
 */
export default function HomePage({ active }: { active: boolean }) {
  const [initialHash] = useState(() => window.location.hash.replace("#", ""));
  const [introDone, setIntroDone] = useState(Boolean(initialHash));
  // the page starts its entrance as the black begins to sweep away, not after it has gone
  const [revealing, setRevealing] = useState(Boolean(initialHash));
  const startReveal = useCallback(() => setRevealing(true), []);
  const finishIntro = useCallback(() => setIntroDone(true), []);
  const [menuOpen, setMenuOpen] = useState(false);
  const toggleMenu = useCallback(() => setMenuOpen((open) => !open), []);

  // the header draws in dark ink over light sections and in white over dark ones
  const [headerOnDark, setHeaderOnDark] = useState(false);
  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", () => setHeaderOnDark(isDarkUnderHeader()));

  // a reload (even a hard one) opens at the top, at the intro and the hero, instead of the
  // browser putting the page back where it was scrolled before
  useEffect(() => {
    const { history } = window;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    if (!initialHash) window.scrollTo(0, 0);
    return () => {
      history.scrollRestoration = previous;
    };
  }, [initialHash]);

  // landing on /#section: jump there once the page has laid out
  useEffect(() => {
    if (!initialHash) return;
    const timers = [350, 1400].map((delay) =>
      window.setTimeout(() => document.getElementById(initialHash)?.scrollIntoView({ behavior: "auto" }), delay),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [initialHash]);

  // a menu link to a section on this page closes the menu and scrolls smoothly to the target
  useEffect(() => {
    const onHashChange = () => {
      setMenuOpen(false);
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        window.setTimeout(() => {
          document.getElementById(hash)?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 60);
      }
    };
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <div className="relative min-h-screen bg-white">
      {!introDone && <HomeIntro onLeave={startReveal} onDone={finishIntro} start={active} />}
      <div className={headerOnDark ? "" : "stage-light"} style={MENU_TONE}>
        <Header menuOpen={menuOpen} onToggleMenu={toggleMenu} hidden={!revealing} />
        <MenuFrame open={menuOpen} />
      </div>
      {/* the page slides down under the open menu, as on the other pages */}
      <motion.main
        animate={{ y: menuOpen ? "6.25rem" : 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => menuOpen && setMenuOpen(false)}
        className={`relative z-30 origin-top overflow-x-clip bg-white ${menuOpen ? "cursor-pointer" : ""}`}
      >
        {/* as the black sweeps up, the hero rises gently into place beneath it */}
        <motion.div
          initial={initialHash ? false : { y: 90, scale: 0.97 }}
          animate={revealing ? { y: 0, scale: 1 } : undefined}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10"
        >
          <HomeHero play={revealing} />
        </motion.div>
        {/* the statement starts under the hero, so its curved bottom edge opens onto black */}
        <div className="-mt-[min(14dvh,16vw)]">
          <HomeStatement />
        </div>
        <HomeFutureNetwork />
        <HomeEditorialThesis />
        <HomeClients />
        <HomeTestimonials />
        <HomeGlobalPresence />
        <HomeContact />
      </motion.main>
    </div>
  );
}
