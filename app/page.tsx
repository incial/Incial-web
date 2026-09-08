"use client";

import { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { greetings } from "@/lib/constants";
import { Header } from "@/components/layout";
import {
  GreetingsOverlay,
  ScrollSection,
  TrustSection,
  ClientSection,
  ContactSection,
} from "@/components/sections";
import { useDevice } from "@/hooks";
import { lockGlobalScroll } from "@/lib/scrollLock";

// All scrollable section phases (preloader greetings is handled separately)
const ALL_PHASES = ["scrolling", "trust", "client", "contact"] as const;
type Phase = "greetings" | (typeof ALL_PHASES)[number];

const sectionVariants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "100vh" : 0,
    scale: direction > 0 ? 1 : 0.94,
    opacity: direction > 0 ? 1 : 0.42,
    borderTopLeftRadius: direction > 0 ? 40 : 0,
    borderTopRightRadius: direction > 0 ? 40 : 0,
    zIndex: direction > 0 ? 20 : 5,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    zIndex: 20,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? 0 : "100vh",
    scale: direction > 0 ? 0.94 : 1,
    opacity: direction > 0 ? 0.42 : 1,
    borderTopLeftRadius: direction > 0 ? 0 : 40,
    borderTopRightRadius: direction > 0 ? 0 : 40,
    zIndex: direction > 0 ? 5 : 30,
  }),
};

const CARD_TRANSITION = { duration: 0.8, ease: [0.22, 1, 0.36, 1] } as const;
const MENU_OFFSET_Y = "6.25rem";

export default function Home() {
  const { isMobile } = useDevice();
  const [phase, setPhase] = useState<Phase>("greetings");
  const [greetingIndex, setGreetingIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeHash, setActiveHash] = useState("");
  const [scrollSectionStartAtEnd, setScrollSectionStartAtEnd] = useState(false);
  const [hasCompletedInitialCrawl, setHasCompletedInitialCrawl] = useState(false);

  /* ── Greeting Preloader Sequence ───────────────── */
  useEffect(() => {
    if (phase !== "greetings") return;

    if (sessionStorage.getItem("initial-load-done")) {
      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
      if (hash === "services") {
        setPhase("scrolling");
      } else if (ALL_PHASES.includes(hash as any)) {
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
      } else if (ALL_PHASES.includes(hash as any)) {
        setPhase(hash as Phase);
      } else {
        setPhase("scrolling");
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [greetingIndex, phase]);

  /* ── Hash Navigation ────────────────────────────── */
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace("#", "");
      setActiveHash(hash);
      if (hash === "services") {
        setPhase("scrolling");
      } else if (ALL_PHASES.includes(hash as any)) {
        setPhase(hash as Phase);
      }
      lockGlobalScroll(950);
      setDirection(1);
      setMenuOpen(false);
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const handleToggleMenu = useCallback(() => {
    setMenuOpen((prev) => !prev);
  }, []);

  return (
    <>
      {phase === "greetings" && (
        <GreetingsOverlay greetingIndex={greetingIndex} />
      )}

      <div
        className={`fixed inset-0 overflow-hidden ${
          phase === "greetings" ? "bg-black" : "bg-white"
        }`}
        style={{
          opacity: phase === "greetings" ? 0 : 1,
          transition: "opacity 0.6s ease-in-out",
          pointerEvents: phase === "greetings" ? "none" : "auto",
        }}
      >
        <Header menuOpen={menuOpen} onToggleMenu={handleToggleMenu} hideMobile />

        <motion.div
          initial={{ borderRadius: 0 }}
          animate={{
            y: menuOpen ? MENU_OFFSET_Y : 0,
            scale: menuOpen ? 0.95 : 1,
            borderRadius: menuOpen ? 24 : 0,
          }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={() => {
            if (menuOpen) setMenuOpen(false);
          }}
          className={`relative origin-top overflow-hidden bg-black text-white h-screen w-full ${
            menuOpen ? "cursor-pointer shadow-[0_25px_60px_rgba(0,0,0,0.35)]" : ""
          }`}
        >
          <AnimatePresence mode="sync" custom={direction}>
            {phase === "scrolling" && (
              <motion.div
                key="scroll"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={CARD_TRANSITION}
                className="absolute inset-0 w-full h-screen overflow-hidden"
              >
                <ScrollSection
                  activeHash={activeHash}
                  startAtEnd={scrollSectionStartAtEnd}
                  skipAnimation={hasCompletedInitialCrawl}
                  onScrollComplete={() => {
                    setHasCompletedInitialCrawl(true);
                    setScrollSectionStartAtEnd(false);
                    setDirection(1);
                    setPhase("trust");
                  }}
                  onBack={() => {
                    setScrollSectionStartAtEnd(false);
                  }}
                />
              </motion.div>
            )}

            {phase === "trust" && (
              <motion.div
                key="trust"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={CARD_TRANSITION}
                className="absolute inset-0 w-full h-screen overflow-hidden"
              >
                <TrustSection
                  onBack={() => {
                    setDirection(-1);
                    setScrollSectionStartAtEnd(true);
                    setPhase("scrolling");
                  }}
                  onComplete={() => {
                    setDirection(1);
                    setPhase("client");
                  }}
                />
              </motion.div>
            )}

            {phase === "client" && (
              <motion.div
                key="client"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={CARD_TRANSITION}
                className="absolute inset-0 w-full h-screen overflow-hidden"
              >
                <ClientSection
                  onBack={() => {
                    setDirection(-1);
                    setPhase("trust");
                  }}
                  onComplete={() => {
                    setDirection(1);
                    setPhase("contact");
                  }}
                />
              </motion.div>
            )}

            {phase === "contact" && (
              <motion.div
                key="contact"
                custom={direction}
                variants={sectionVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={CARD_TRANSITION}
                className="absolute inset-0 w-full h-screen overflow-hidden"
              >
                <ContactSection
                  onBack={() => {
                    setDirection(-1);
                    setPhase("client");
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}