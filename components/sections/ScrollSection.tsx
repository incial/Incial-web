"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { rotatingWords } from "@/lib/constants";
import { isGlobalScrollLocked, lockGlobalScroll } from "@/lib/scrollLock";

// Components
import RotatingText from "@/components/features/home/RotatingText";
import LogoScreen from "@/components/features/home/LogoScreen";
import BackgroundCircle from "@/components/features/home/BackgroundCircle";
import ServicesSection from "@/components/sections/ServicesSection";
import { MobileServicePage } from "@/components/mobile";
import { useDevice } from "@/hooks";

interface ScrollSectionProps {
  onScrollComplete?: () => void;
  onBack?: () => void;
  startAtEnd?: boolean;
  skipAnimation?: boolean;
  activeHash?: string;
}

type DesktopSection = "words" | "logo" | "services";

const desktopSectionVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "100%" : "-100%",
    opacity: 0,
  }),
  center: {
    y: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? "-100%" : "100%",
    opacity: 0,
  }),
};

const desktopSectionTransition = {
  duration: 0.8,
  ease: [0.22, 1, 0.36, 1],
} as const;

const servicesCardVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "100%" : 0,
    scale: direction > 0 ? 0.98 : 1,
    opacity: 1,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? 0 : "100%",
    scale: direction > 0 ? 0.94 : 0.98,
    opacity: direction > 0 ? 0.4 : 1,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
  }),
};

export default function ScrollSection({
  onScrollComplete,
  onBack,
  startAtEnd = false,
  skipAnimation = false,
  activeHash,
}: ScrollSectionProps) {
  const { isMobile, isLoading: isDeviceLoading } = useDevice();
  const [wordIndex, setWordIndex] = useState(() => {
    if (activeHash === "services") return rotatingWords.length - 1;
    return startAtEnd ? rotatingWords.length - 1 : 0;
  });
  const [desktopSection, setDesktopSection] = useState<DesktopSection>(() => {
    if (activeHash === "services") return "services";
    return startAtEnd ? "services" : "words";
  });
  const [desktopDirection, setDesktopDirection] = useState(1);
  const [returnFromServices, setReturnFromServices] = useState(false);
  const [servicesStartAtEnd, setServicesStartAtEnd] = useState(startAtEnd);

  useEffect(() => {
    setServicesStartAtEnd(startAtEnd);
  }, [startAtEnd]);

  const isScrolling = useRef(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const showLogo = desktopSection !== "words";
  const showServices = desktopSection === "services";

  const goToDesktopSection = (
    nextSection: DesktopSection,
    nextDirection: 1 | -1,
  ) => {
    setDesktopDirection(nextDirection);
    setDesktopSection(nextSection);
  };

  useEffect(() => {
    if (activeHash === "services") {
      requestAnimationFrame(() => {
        setDesktopSection("services");
        setWordIndex(rotatingWords.length - 1);
      });
    }
  }, [activeHash]);

  useEffect(() => {
    if (isMobile || isDeviceLoading) return;

    // Auto flow: keep advancing wordIndex until we reach the end, then showLogo.
    // If startAtEnd is true, this won't run because showLogo is true or wordIndex is at max.
    if (desktopSection === "words") {
      const timer = setTimeout(() => {
        if (wordIndex < rotatingWords.length - 1) {
          setWordIndex((prev) => prev + 1);
        } else {
          goToDesktopSection("logo", 1);
        }
      }, 1500); // Increased from 700ms to 1500ms per word
      return () => clearTimeout(timer);
    }
  }, [desktopSection, wordIndex, isMobile, isDeviceLoading]);

  useEffect(() => {
    if (isMobile || isDeviceLoading) return;

    const isCoarsePointer =
      typeof window !== "undefined" &&
      window.matchMedia("(pointer: coarse)").matches;
    const scrollThreshold = isCoarsePointer ? 24 : 40;
    const scrollLockMs = isCoarsePointer ? 700 : 800;

    const lockScroll = () => {
      isScrolling.current = true;
      setTimeout(() => {
        isScrolling.current = false;
      }, scrollLockMs);
    };

    const handleScroll = (e: WheelEvent) => {
      // When services is active, ServicesSection manages its own deliberate scroll catcher
      if (desktopSection === "services") return;
      if (Math.abs(e.deltaY) < scrollThreshold) return;
      e.preventDefault();
      if (isScrolling.current || isGlobalScrollLocked()) return;

      if (e.deltaY > 0) {
        // Scroll Down
        lockScroll();

        if (desktopSection === "words") {
          // If the user scrolls down during the introductory text rotation,
          // instantly jump to the finished LogoScreen state.
          setReturnFromServices(true);
          goToDesktopSection("logo", 1);
        } else if (desktopSection === "logo") {
          lockGlobalScroll(1000);
          setServicesStartAtEnd(false);
          goToDesktopSection("services", 1);
        }
      } else if (e.deltaY < 0) {
        // Scroll Up
        lockScroll();
        if (desktopSection === "logo" && onBack) {
          onBack();
        } else if (desktopSection === "words" && onBack) {
          // Allow backing out even while auto-animating
          onBack();
        }
      }
    };

    // Touch support (basic Swipe)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      // When services is active, ServicesSection manages its own touch catcher
      if (desktopSection === "services") return;
      e.preventDefault();

      if (isScrolling.current || isGlobalScrollLocked()) return;

      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) > scrollThreshold) {
        if (deltaY > 0) {
          // Swipe Up / Scroll Down
          lockScroll();

          if (desktopSection === "words") {
            setReturnFromServices(true);
            goToDesktopSection("logo", 1);
          } else if (desktopSection === "logo") {
            lockGlobalScroll(1000);
            setServicesStartAtEnd(false);
            goToDesktopSection("services", 1);
          }
        } else {
          // Swipe Down / Scroll Up
          lockScroll();
          if (desktopSection === "logo" && onBack) {
            onBack();
          } else if (desktopSection === "words" && onBack) {
            onBack();
          }
        }
      }
    };

    window.addEventListener("wheel", handleScroll, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: false });
    window.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      window.removeEventListener("wheel", handleScroll);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [desktopSection, onBack, isMobile, isDeviceLoading]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="sticky top-0 flex h-screen w-full flex-col overflow-hidden">
        {/* Main Interaction Area */}
        <main className="relative z-20 flex flex-1 w-full h-full items-center justify-center">
          {isDeviceLoading ? (
            <div className="h-full w-full bg-black" />
          ) : isMobile ? (
            <MobileServicePage skipPreloader activeHash={activeHash} />
          ) : (
            <>
              <AnimatePresence mode="wait" custom={desktopDirection}>
                {desktopSection === "words" && (
                  <motion.div
                    key="rotating-words"
                    custom={desktopDirection}
                    variants={desktopSectionVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={desktopSectionTransition}
                    className="absolute inset-0 flex h-full w-full items-center justify-center"
                  >
                    <RotatingText
                      wordIndex={wordIndex}
                      words={rotatingWords}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {desktopSection !== "words" && (
                <motion.div
                  key="logo"
                  initial={false}
                  animate={{
                    opacity: desktopSection === "services" ? 0.38 : 1,
                    scale: desktopSection === "services" ? 0.94 : 1,
                    y: desktopSection === "services" ? -24 : 0,
                  }}
                  transition={
                    desktopSection === "logo"
                      ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                      : { duration: 0.85, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="absolute inset-0 h-full w-full origin-top"
                >
                  <LogoScreen
                    skipAnimation={
                      startAtEnd || returnFromServices || skipAnimation
                    }
                  />
                </motion.div>
              )}

              <AnimatePresence custom={desktopDirection}>
                {desktopSection === "services" && (
                  <motion.div
                    key="services"
                    custom={desktopDirection}
                    variants={servicesCardVariants}
                    initial={startAtEnd ? "center" : "enter"}
                    animate="center"
                    exit="exit"
                    transition={desktopSectionTransition}
                    className="absolute inset-0 h-full w-full overflow-hidden rounded-t-[32px] sm:rounded-t-[40px] md:rounded-t-[44px] border-t border-x border-white/20 shadow-[0_-25px_60px_rgba(0,0,0,0.95),inset_0_1px_0_rgba(255,255,255,0.2)] z-30"
                  >
                    <ServicesSection
                      initialSlide={1}
                      startAtEnd={servicesStartAtEnd}
                      onComplete={onScrollComplete}
                      onBack={() => {
                        setReturnFromServices(true);
                        setServicesStartAtEnd(false);
                        lockGlobalScroll(900);
                        goToDesktopSection("logo", -1);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </main>

        {/* Animated Background - Only shown before services */}
        {!isMobile && !showServices && (
          <BackgroundCircle
            circleRef={circleRef}
            wordIndex={wordIndex}
            showLogo={showLogo}
            totalWords={rotatingWords.length}
          />
        )}
      </div>
    </div>
  );
}
