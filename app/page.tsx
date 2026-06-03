"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { greetings } from "@/lib/constants";
import { Header } from "@/components/layout";
import { GreetingsOverlay, ScrollSection } from "@/components/sections";
import { useDevice } from "@/hooks";
import type { SectionConfig } from "@/lib/dataLoader";
import { fetchJsonIfAvailable } from "@/lib/adminApi";

import TrustSection from "@/components/sections/TrustSection";
import ClientSection from "@/components/sections/ClientSection";
import ContactSection from "@/components/sections/ContactSection";

// All scrollable section phases (greetings preloader is handled separately)
const ALL_PHASES = ["scrolling", "trust", "client", "contact"] as const;
type Phase = "greetings" | (typeof ALL_PHASES)[number];

const sectionVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "100vh" : 0,
    scale: direction > 0 ? 0.96 : 0.94,
    opacity: direction > 0 ? 0.96 : 0.42,
    borderTopLeftRadius: direction > 0 ? 40 : 0,
    borderTopRightRadius: direction > 0 ? 40 : 0,
    zIndex: direction > 0 ? 10 : 0,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    zIndex: 5,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? 0 : "100vh",
    scale: direction > 0 ? 0.94 : 0.96,
    opacity: direction > 0 ? 0.42 : 0.96,
    borderTopLeftRadius: direction > 0 ? 0 : 40,
    borderTopRightRadius: direction > 0 ? 0 : 40,
    zIndex: direction > 0 ? 0 : 10,
  }),
};

const MENU_OFFSET_Y = "6.25rem";

export default function Home() {
  const { isMobile } = useDevice();
  const [phase, setPhase] = useState<Phase>("greetings");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [scrollSectionStartAtEnd, setScrollSectionStartAtEnd] = useState(false);
  const [hasCompletedInitialCrawl, setHasCompletedInitialCrawl] =
    useState(false);
  const [enabledSections, setEnabledSections] = useState<string[]>(
    ALL_PHASES as unknown as string[],
  );

  /* ── Load section config from API ────────────────── */
  useEffect(() => {
    fetchJsonIfAvailable<{ sections: SectionConfig[] }>("/api/admin/sections")
      .then((data) => {
        if (!data?.sections) {
          setEnabledSections([...ALL_PHASES]);
          return;
        }

        const enabled = data.sections.filter((s) => s.enabled).map((s) => s.id);
        // Always keep scrolling (homepage) enabled as fallback
        setEnabledSections(enabled.length > 0 ? enabled : ["scrolling"]);
      })
      .catch(() => {
        // Fallback: show all sections if API fails
        setEnabledSections([...ALL_PHASES]);
      });
  }, []);

  /* ── Helper: get ordered list of enabled phases ─── */
  const orderedEnabledPhases = ALL_PHASES.filter((p) =>
    enabledSections.includes(p),
  );

  function getNextPhase(current: Phase, dir: 1 | -1): Phase {
    if (current === "greetings") {
      return "scrolling";
    }

    const idx = orderedEnabledPhases.indexOf(
      current as (typeof ALL_PHASES)[number],
    );
    if (dir === 1) {
      return orderedEnabledPhases[idx + 1] ?? current;
    } else {
      return orderedEnabledPhases[idx - 1] ?? current;
    }
  }

  /* ── Greeting Preloader Sequence ───────────────── */
  useEffect(() => {
    if (phase !== "greetings") return;

    if (sessionStorage.getItem("initial-load-done")) {
      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
      if (hash === "services") {
        setPhase("scrolling");
      } else if (hash && enabledSections.includes(hash)) {
        setPhase(hash as Phase);
      } else {
        setPhase("scrolling");
      }
      setHasCompletedInitialCrawl(true);
      return;
    }

    if (greetingIndex < greetings.length - 1) {
      const timer = setTimeout(() => setGreetingIndex((prev) => prev + 1), 500);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(() => {
      setDirection(1);
      sessionStorage.setItem("initial-load-done", "true");

      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
      if (hash === "services") {
        setPhase("scrolling");
      } else if (hash && enabledSections.includes(hash)) {
        setPhase(hash as Phase);
      } else {
        setPhase("scrolling");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [greetingIndex, phase, enabledSections]);

  /* ── Hash Navigation ────────────────────────────── */
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
      if (hash === "services") {
        setPhase("scrolling");
        setDirection(1);
        setMenuOpen(false); // Close menu if we navigated from NavMenu
      } else if (hash && enabledSections.includes(hash)) {
        setPhase(hash as Phase);
        setDirection(1);
        setMenuOpen(false); // Close menu if we navigated from NavMenu
      }
    };

    // Check on initial load too. Since enabledSections is loaded asynchronously,
    // we also check right away assuming default ALL_PHASES includes it.
    handleHash();

    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, [enabledSections]);

  const handleToggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  const goBack = (current: Phase) => {
    setDirection(-1);
    setPhase(getNextPhase(current, -1));
  };

  const isPreloading = phase === "greetings";

  return (
    <>
      {/* Greetings preloader overlay */}
      <AnimatePresence>
        {phase === "greetings" && (
          <GreetingsOverlay greetingIndex={greetingIndex} />
        )}
      </AnimatePresence>

      {/* Main page */}
      <div className="relative bg-white">
        {!isPreloading && !(isMobile && phase === "scrolling") && (
          <Header menuOpen={menuOpen} onToggleMenu={handleToggleMenu} />
        )}

        <motion.div
          initial={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}
          animate={{
            y: menuOpen ? MENU_OFFSET_Y : 0,
            scale: menuOpen ? 0.95 : 1,
            borderTopLeftRadius: menuOpen ? 24 : 0,
            borderTopRightRadius: menuOpen ? 24 : 0,
          }}
          className="relative origin-top overflow-hidden bg-black text-white"
        >
          <AnimatePresence mode="popLayout" custom={direction}>
            {phase === "scrolling" && (
              <motion.div
                key="scroll"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-screen overflow-hidden"
              >
                <ScrollSection
                  activeHash={activeHash}
                  startAtEnd={scrollSectionStartAtEnd}
                  skipAnimation={hasCompletedInitialCrawl}
                  onScrollComplete={() => {
                    setHasCompletedInitialCrawl(true);
                    const next = getNextPhase("scrolling", 1);
                    if (next !== "scrolling") {
                      setDirection(1);
                      setPhase(next);
                    }
                  }}
                  onBack={() => {
                    // Allow scrolling up from LogoScreen to trigger back behavior
                    // Going back from scrolling section stays in scrolling phase
                    setDirection(-1);
                    setPhase("scrolling");
                  }}
                />
              </motion.div>
            )}

            {phase === "trust" && enabledSections.includes("trust") && (
              <motion.div
                key="trust"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-screen overflow-hidden"
              >
                <TrustSection
                  onBack={() => {
                    setDirection(-1);
                    setScrollSectionStartAtEnd(true);
                    setPhase("scrolling");
                  }}
                  onComplete={() => {
                    const next = getNextPhase("trust", 1);
                    if (next !== "trust") {
                      setDirection(1);
                      setPhase(next);
                    }
                  }}
                />
              </motion.div>
            )}

            {phase === "client" && enabledSections.includes("client") && (
              <motion.div
                key="client"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-screen overflow-hidden"
              >
                <ClientSection
                  onBack={() => goBack("client")}
                  onComplete={() => {
                    const next = getNextPhase("client", 1);
                    if (next !== "client") {
                      setDirection(1);
                      setPhase(next);
                    }
                  }}
                />
              </motion.div>
            )}

            {phase === "contact" && enabledSections.includes("contact") && (
              <motion.div
                key="contact"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                className="w-full h-screen overflow-hidden"
              >
                <ContactSection onBack={() => goBack("contact")} />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}