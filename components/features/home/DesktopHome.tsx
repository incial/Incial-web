"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from "framer-motion";
import type Lenis from "lenis";
import { Header, MenuFrame } from "@/components/layout";
import { useViewProgress } from "@/lib/useViewProgress";
import ServicesScroller from "@/components/features/services/ServicesScroller";
import { rotatingWords } from "@/lib/constants";
import { SERVICE_CATEGORIES } from "@/lib/serviceCatalog";
import BackgroundCircle from "./BackgroundCircle";
import LogoScreen from "./LogoScreen";
import ScrollHint from "@/components/ui/ScrollHint";
import RotatingText from "./RotatingText";
import ShaderBackground from "@/components/ui/ShaderBackground";

// Everything below the services scroll loads on demand, then simply scrolls in.
const SectionPlaceholder = () => <div aria-hidden className="min-h-dvh bg-black" />;
const TrustZoomStage = dynamic(() => import("./TrustZoomStage"));
const ClientSection = dynamic(() => import("@/components/sections/ClientSection"), {
  loading: SectionPlaceholder,
});
const ContactSection = dynamic(() => import("@/components/sections/ContactSection"), {
  loading: SectionPlaceholder,
});

/** Scroll length of the logo-to-trust transition, in viewport heights. */
const TRUST_TAIL_DVH = 300;
/**
 * The services logo rests pinned for this long (viewport heights) after it has re-formed. The
 * Trust stage is pinned over it from the start of that rest, so the grainy logo and the solid
 * one dissolve into each other in the same spot instead of one scrolling away from the other.
 */
const SERVICES_HOLD_DVH = 26;
/**
 * After the Trust stage has held, the clients section rises over it for this long (viewport
 * heights) while the Trust content drifts up more slowly: a parallax hand-over.
 */
const TRUST_EXIT_DVH = 100;
/** The clients section holds for CLIENTS_HOLD_DVH, then the contact section rises over it. */
const CONTACT_EXIT_DVH = 100;
const CLIENTS_HOLD_DVH = 40;

/**
 * The clients section stays pinned while the contact section slides up over it (the same
 * parallax hand-over as Trust to clients): the clients layer drifts up slowly and dims.
 */
function ClientsToContact() {
  const contactRef = useRef<HTMLDivElement>(null);
  const contactRise = useViewProgress(contactRef);

  return (
    <>
      {/* overlaps the end of the Trust tail, then stays pinned for the hold and the contact rise */}
      <div
        className="relative z-30"
        style={{
          marginTop: `-${TRUST_EXIT_DVH}dvh`,
          height: `${100 + CLIENTS_HOLD_DVH + CONTACT_EXIT_DVH}dvh`,
        }}
      >
        <div className="sticky top-0 h-dvh">
          <ClientSection exit={contactRise} />
        </div>
      </div>
      <div ref={contactRef} className="relative z-40" style={{ marginTop: `-${CONTACT_EXIT_DVH}dvh` }}>
        <ContactSection />
      </div>
    </>
  );
}

/**
 * Pinned over the page from the moment the services scroll ends: the camera dives through the
 * logo and the Trust section opens from its centre, then scrolls away like any other section.
 */
function TrustTransition() {
  const tailRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);
  const exit = useMotionValue(0);
  const { scrollY } = useScroll();

  // `progress`: 0 when the tail's top meets the bottom of the screen, 1 after TRUST_TAIL_DVH of
  // scrolling. `exit`: 0 -> 1 over the TRUST_EXIT_DVH after that. Read from the live layout, so
  // lazily loaded content above can never throw it off.
  const update = useCallback(() => {
    const tail = tailRef.current;
    if (!tail) return;
    const { top } = tail.getBoundingClientRect();
    const vh = window.innerHeight;
    const travelled = vh - top;
    const mainSpan = (TRUST_TAIL_DVH / 100) * vh;
    const exitSpan = (TRUST_EXIT_DVH / 100) * vh;
    progress.set(Math.min(1, Math.max(0, travelled / mainSpan)));
    exit.set(Math.min(1, Math.max(0, (travelled - mainSpan) / exitSpan)));
  }, [progress, exit]);

  useMotionValueEvent(scrollY, "change", update);
  useEffect(() => {
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [update]);

  return (
    <>
      <div
        className="pointer-events-none sticky top-0 z-20 h-dvh w-full"
        style={{ marginTop: `calc(-1 * (100dvh + ${SERVICES_HOLD_DVH}dvh))` }}
      >
        <TrustZoomStage progress={progress} exit={exit} withBackdrop />
      </div>
      <div ref={tailRef} className="relative" style={{ height: `${TRUST_TAIL_DVH + TRUST_EXIT_DVH}dvh` }}>
        {/* #trust lands on the finished section rather than the middle of the dive */}
        <div id="trust" aria-hidden className="absolute left-0 top-[110dvh]" />
      </div>
    </>
  );
}

interface DesktopHomeProps {
  /**
   * False while the greeting overlay still covers the page: the page mounts (and its heavy parts
   * load) behind it, but the intro words wait. Becomes true when the greetings finish.
   */
  isActive?: boolean;
}

type IntroStage = "words" | "logo";

const MENU_OFFSET_Y = "6.25rem";
const WORD_INTERVAL_MS = 1500;
/** "And Beyond." stays longer: the globe needs its rise to finish and be seen before the logo. */
const LAST_WORD_HOLD_MS = 2400;
const WORDS_FADE_MS = 450;
const HASH_SCROLL_DELAYS_MS = [350, 1400];
/** A link to a section hides the page behind black while it jumps there, so the hero is never seen on the way. */
const HASH_COVER_FADE_MS = 280;
const HASH_COVER_REVEAL_MS = 700;

/**
 * The desktop home page as one continuous scroll: the intro words and logo, the services
 * stack (the logo dissolves into it as you scroll), then trust, clients and contact.
 */
export default function DesktopHome({ isActive = true }: DesktopHomeProps) {
  const [initialHash] = useState(() => window.location.hash.replace("#", ""));
  const [menuOpen, setMenuOpen] = useState(false);
  const [stage, setStage] = useState<IntroStage>(initialHash ? "logo" : "words");
  const [wordIndex, setWordIndex] = useState(initialHash ? rotatingWords.length - 1 : 0);
  // the logo appears only once the last word has finished fading out, so the two never overlap
  const [areWordsGone, setAreWordsGone] = useState(Boolean(initialHash));
  const lenisRef = useRef<Lenis | null>(null);
  const stageRef = useRef<IntroStage>(stage);

  // the hero's buttons fade as scrolling starts; the logo itself dissolves into dust (see below)
  const { scrollY: heroScrollY } = useScroll();
  const heroOpacity = useTransform(heroScrollY, [0, 160], [1, 0]);

  /* ── Smooth scrolling (fine pointers only; touch keeps native momentum) ── */
  useEffect(() => {
    const canSmooth =
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      window.matchMedia("(pointer: fine)").matches;
    if (!canSmooth) return;

    let disposed = false;
    let instance: Lenis | null = null;
    import("lenis").then(({ default: LenisCtor }) => {
      if (disposed) return;
      instance = new LenisCtor({ duration: 1.1, smoothWheel: true, autoRaf: true });
      lenisRef.current = instance;
      if (stageRef.current === "words") instance.stop();
    });

    // The page grows once the intro ends and lazy sections load: keep Lenis's scroll limit current.
    const resizeObserver = new ResizeObserver(() => lenisRef.current?.resize());
    resizeObserver.observe(document.body);

    // Safety net: if a downward wheel gesture moves nothing although there is room to scroll,
    // drop smooth scrolling and let the browser scroll natively.
    const verifyWheel = (event: WheelEvent) => {
      if (event.deltaY <= 0 || stageRef.current === "words" || !lenisRef.current) return;
      const before = window.scrollY;
      setTimeout(() => {
        const room = document.documentElement.scrollHeight - window.innerHeight - window.scrollY;
        if (window.scrollY === before && room > 50 && lenisRef.current) {
          lenisRef.current.destroy();
          lenisRef.current = null;
        }
      }, 600);
    };
    window.addEventListener("wheel", verifyWheel, { passive: true });

    return () => {
      disposed = true;
      resizeObserver.disconnect();
      window.removeEventListener("wheel", verifyWheel);
      instance?.destroy();
      lenisRef.current = null;
    };
  }, []);

  /* ── Intro: words advance on their own, then the logo; scroll is held until then ── */
  useEffect(() => {
    stageRef.current = stage;
    if (stage !== "words") {
      // belt and braces: whatever happened during the intro, scrolling is free from here on
      document.documentElement.style.overflow = "";
      lenisRef.current?.start();
      return;
    }

    const root = document.documentElement;
    root.style.overflow = "hidden";
    lenisRef.current?.stop();
    return () => {
      root.style.overflow = "";
      lenisRef.current?.start();
    };
  }, [stage]);

  // once the words have faded out they are removed and the logo takes their place
  useEffect(() => {
    if (stage !== "logo" || areWordsGone) return;
    const timer = setTimeout(() => setAreWordsGone(true), WORDS_FADE_MS);
    return () => clearTimeout(timer);
  }, [stage, areWordsGone]);

  useEffect(() => {
    if (stage !== "words" || !isActive) return;

    const isLastWord = wordIndex >= rotatingWords.length - 1;
    const timer = setTimeout(
      () => {
        if (isLastWord) setStage("logo");
        else setWordIndex((index) => index + 1);
      },
      isLastWord ? LAST_WORD_HOLD_MS : WORD_INTERVAL_MS,
    );
    return () => clearTimeout(timer);
  }, [stage, wordIndex, isActive]);

  // any scroll gesture or key press skips ahead to the logo
  useEffect(() => {
    if (stage !== "words" || !isActive) return;

    const skip = () => setStage("logo");
    window.addEventListener("wheel", skip, { passive: true, once: true });
    window.addEventListener("touchstart", skip, { passive: true, once: true });
    window.addEventListener("keydown", skip, { once: true });
    return () => {
      window.removeEventListener("wheel", skip);
      window.removeEventListener("touchstart", skip);
      window.removeEventListener("keydown", skip);
    };
  }, [stage, isActive]);

  /* ── Anchor links (#contact, #client, #trust) scroll within the page ── */
  const scrollToHash = useCallback((immediate: boolean) => {
    const id = window.location.hash.replace("#", "");
    const target = id ? document.getElementById(id) : null;
    if (!target) return;

    const lenis = lenisRef.current;
    if (lenis) lenis.scrollTo(target, { immediate });
    else target.scrollIntoView({ behavior: immediate ? "auto" : "smooth" });
  }, []);

  // black over the page while a jump to a section is under way
  const [hashCover, setHashCover] = useState(Boolean(initialHash));

  useEffect(() => {
    const pending: ReturnType<typeof setTimeout>[] = [];

    const handleHash = () => {
      setMenuOpen(false);
      if (stageRef.current === "words") setStage("logo");
      // fade to black, jump straight to the section (not flying through the hero and the services), fade back
      setHashCover(true);
      pending.push(
        setTimeout(() => scrollToHash(true), HASH_COVER_FADE_MS),
        setTimeout(() => setHashCover(false), HASH_COVER_FADE_MS + 350),
      );
    };
    window.addEventListener("hashchange", handleHash);

    // landing on /#contact: the page is hidden until the lazy sections have taken their space and the jump has happened
    if (initialHash) {
      HASH_SCROLL_DELAYS_MS.forEach((delay) => pending.push(setTimeout(() => scrollToHash(true), delay)));
      pending.push(setTimeout(() => setHashCover(false), HASH_COVER_REVEAL_MS));
    }

    return () => {
      window.removeEventListener("hashchange", handleHash);
      pending.forEach(clearTimeout);
    };
  }, [initialHash, scrollToHash]);

  const handleToggleMenu = useCallback(() => setMenuOpen((open) => !open), []);
  const showLogo = stage === "logo";

  // The heavy sections (services scroller, trust, clients, contact) mount while the intro words
  // play, in an idle moment, so nothing big has to mount at the instant the logo appears (that
  // spike is what made the intro hitch). Scrolling is locked during the words, so it is unseen.
  // 0: nothing yet, 1: services scroller, 2: trust stage, 3: clients and contact. One step per
  // idle moment, so no single mount is big enough to be felt.
  const [heavyStage, setHeavyStage] = useState(initialHash ? 3 : 0);
  useEffect(() => {
    if (heavyStage >= 3) return;
    if (heavyStage === 0 && isActive && stage === "words" && wordIndex < 1) return;

    const next = () => setHeavyStage((current) => current + 1);
    if (heavyStage === 0 && typeof window.requestIdleCallback === "function") {
      const handle = window.requestIdleCallback(next, { timeout: 1200 });
      return () => window.cancelIdleCallback(handle);
    }
    const timer = setTimeout(next, heavyStage === 0 ? 300 : 500);
    return () => clearTimeout(timer);
  }, [heavyStage, isActive, stage, wordIndex]);

  return (
    <div className="relative min-h-screen bg-white">
      <Header menuOpen={menuOpen} onToggleMenu={handleToggleMenu} hideMobile />
      <MenuFrame open={menuOpen} />

      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-[45] bg-black transition-opacity ease-out"
        style={{ opacity: hashCover ? 1 : 0, transitionDuration: `${HASH_COVER_FADE_MS}ms` }}
      />

      <motion.div
        animate={{
          y: menuOpen ? MENU_OFFSET_Y : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        onClick={() => {
          if (menuOpen) setMenuOpen(false);
        }}
        className={`relative origin-top overflow-x-clip bg-black text-white selection:bg-white/20 ${
          menuOpen ? "cursor-pointer" : ""
        }`}
        style={{ zIndex: 30 }}
      >
        {/* The hero stays pinned while the services scroller (transparent, laid over it) runs. */}
        <div className="relative">
          <div className="sticky top-0 h-dvh w-full overflow-hidden bg-black">
            {/* near-black shader surface behind the hero, melting into the black below it */}
            <ShaderBackground className="absolute inset-0 z-0 h-full w-full" fadeBottom={0.4} />
            <motion.div style={{ opacity: heroOpacity }} className="absolute inset-0 z-20">
              {!areWordsGone && (
                <motion.div
                  animate={{ opacity: stage === "words" ? 1 : 0 }}
                  transition={{ duration: WORDS_FADE_MS / 1000 }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <RotatingText wordIndex={wordIndex} words={rotatingWords} />
                </motion.div>
              )}

              {showLogo && areWordsGone && (
                <div className="absolute inset-0">
                  {/* the logo always draws itself, except when a link jumps straight into the page */}
                  <LogoScreen skipAnimation={Boolean(initialHash)} />
                  <ScrollHint
                    delay={initialHash ? 0.4 : 3.4}
                    className="absolute bottom-[clamp(1.25rem,4.5dvh,3rem)] left-1/2 -translate-x-1/2"
                  />
                </div>
              )}
            </motion.div>

            <BackgroundCircle
              wordIndex={wordIndex}
              showLogo={showLogo}
              totalWords={rotatingWords.length}
            />
          </div>

          {heavyStage >= 1 && (
            <>
              {/* the hero logo dissolves into dust that settles into the stack; at the end the stack
                  drops and compresses back into the logo */}
              <div className="pointer-events-none relative z-10 -mt-[100dvh]">
                <ServicesScroller
                  categories={SERVICE_CATEGORIES}
                  logoSource="[data-logo-source]"
                  bridge
                  holdVh={SERVICES_HOLD_DVH}
                />
              </div>
              {heavyStage >= 2 && <TrustTransition />}
            </>
          )}
        </div>

        {heavyStage >= 3 && <ClientsToContact />}
      </motion.div>
    </div>
  );
}
