"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion, Variants } from "framer-motion";
import { rotatingWords } from "@/lib/constants";

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

type DesktopSection = "words" | "logo" | "serviceIntro" | "serviceDetails";

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

const serviceIntroCardVariants: Variants = {
  enter: {
    y: "110%",
    scale: 0.96,
    opacity: 0.96,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  exit: {
    y: "110%",
    scale: 0.96,
    opacity: 0.96,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
  },
};

const serviceDetailsCardVariants: Variants = {
  enter: (direction: number) => ({
    y: direction > 0 ? "110%" : 0,
    scale: direction > 0 ? 0.96 : 1,
    opacity: direction > 0 ? 0.96 : 1,
    borderTopLeftRadius: direction > 0 ? 40 : 0,
    borderTopRightRadius: direction > 0 ? 40 : 0,
  }),
  center: {
    y: 0,
    scale: 1,
    opacity: 1,
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  exit: (direction: number) => ({
    y: direction > 0 ? 0 : "110%",
    scale: direction > 0 ? 0.94 : 0.96,
    opacity: direction > 0 ? 0.42 : 0.96,
    borderTopLeftRadius: direction > 0 ? 0 : 40,
    borderTopRightRadius: direction > 0 ? 0 : 40,
  }),
};

function ServiceIntroSection() {
  return (
    <section className="absolute inset-0 flex h-full w-full flex-col items-center justify-center bg-black px-4 text-center shadow-[0_-40px_100px_rgba(216,232,255,0.16)]">
      <h2 className="text-4xl font-bold text-white md:text-6xl">
        Services That Make Magic Happen
      </h2>
      <p className="mt-4 text-xl italic text-white/80 md:text-2xl">
        (And Seriously Grow Your Business)
      </p>
    </section>
  );
}

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
    if (activeHash === "services") return "serviceDetails";
    return startAtEnd ? "serviceDetails" : "words";
  });
  const [desktopDirection, setDesktopDirection] = useState(1);
  const [returnFromServices, setReturnFromServices] = useState(false);

  const isScrolling = useRef(false);
  const circleRef = useRef<HTMLDivElement>(null);
  const showLogo = desktopSection !== "words";
  const showServices =
    desktopSection === "serviceIntro" || desktopSection === "serviceDetails";

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
        setDesktopSection("serviceDetails");
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
      if (Math.abs(e.deltaY) < scrollThreshold) return;
      e.preventDefault();
      if (isScrolling.current) return;

      if (e.deltaY > 0) {
        // Scroll Down
        lockScroll();

        if (desktopSection === "words") {
          // If the user scrolls down during the introductory text rotation,
          // instantly jump to the finished LogoScreen state.
          setReturnFromServices(true);
          goToDesktopSection("logo", 1);
        } else if (desktopSection === "logo") {
          goToDesktopSection("serviceIntro", 1);
        } else if (desktopSection === "serviceIntro") {
          goToDesktopSection("serviceDetails", 1);
        }
      } else if (e.deltaY < 0) {
        // Scroll Up
        lockScroll();
        if (desktopSection === "serviceDetails") {
          // Handled by ServicesSection going back
        } else if (desktopSection === "serviceIntro") {
          setReturnFromServices(true);
          goToDesktopSection("logo", -1);
        } else if (desktopSection === "logo" && onBack) {
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
      e.preventDefault();

      if (isScrolling.current) return;
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
            goToDesktopSection("serviceIntro", 1);
          } else if (desktopSection === "serviceIntro") {
            goToDesktopSection("serviceDetails", 1);
          }
        } else {
          // Swipe Down / Scroll Up
          lockScroll();
          if (desktopSection === "serviceDetails") {
            // Handled by ServicesSection
          } else if (desktopSection === "serviceIntro") {
            setReturnFromServices(true);
            goToDesktopSection("logo", -1);
          } else if (desktopSection === "logo" && onBack) {
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
                    opacity: (desktopSection === "serviceIntro" || desktopSection === "serviceDetails") ? 0.42 : 1,
                    scale: (desktopSection === "serviceIntro" || desktopSection === "serviceDetails") ? 0.94 : 1,
                  }}
                  transition={
                    desktopSection === "logo"
                      ? { duration: 0.6, ease: [0.16, 1, 0.3, 1] }
                      : { duration: 0.9, ease: [0.22, 1, 0.36, 1] }
                  }
                  className="absolute inset-0 h-full w-full"
                >
                  <LogoScreen
                    skipAnimation={
                      startAtEnd || returnFromServices || skipAnimation
                    }
                  />
                </motion.div>
              )}

              <AnimatePresence>
                {(desktopSection === "serviceIntro" || desktopSection === "serviceDetails") && (
                  <motion.div
                    key="service-intro"
                    initial={startAtEnd ? "underneath" : "enter"}
                    animate={desktopSection === "serviceDetails" ? "underneath" : "center"}
                    variants={{
                      enter: {
                        y: "110%",
                        scale: 0.96,
                        opacity: 0.96,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                      },
                      center: {
                        y: 0,
                        scale: 1,
                        opacity: 1,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                      },
                      underneath: {
                        y: 0,
                        scale: 0.94,
                        opacity: 0.42,
                        borderTopLeftRadius: 0,
                        borderTopRightRadius: 0,
                      },
                      exit: {
                        y: "110%",
                        scale: 0.96,
                        opacity: 0.96,
                        borderTopLeftRadius: 40,
                        borderTopRightRadius: 40,
                      },
                    }}
                    exit="exit"
                    transition={desktopSectionTransition}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                  >
                    <ServiceIntroSection />
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence custom={desktopDirection}>
                {desktopSection === "serviceDetails" && (
                  <motion.div
                    key="service-details"
                    custom={desktopDirection}
                    variants={serviceDetailsCardVariants}
                    initial={startAtEnd ? "center" : "enter"}
                    animate="center"
                    exit="exit"
                    transition={desktopSectionTransition}
                    className="absolute inset-0 h-full w-full overflow-hidden"
                  >
                    <ServicesSection
                      initialSlide={0}
                      onComplete={onScrollComplete}
                      onBack={() => {
                        setReturnFromServices(true);
                        goToDesktopSection("serviceIntro", -1);
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
