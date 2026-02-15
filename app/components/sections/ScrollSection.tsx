"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import { rotatingWords } from "@/app/lib/constants";

// Feature Components
import RotatingText from "@/app/components/features/home/RotatingText";
import FinalReveal from "@/app/components/features/home/FinalReveal";
import LogoScreen from "@/app/components/features/home/LogoScreen";
import BackgroundCircle from "@/app/components/features/home/BackgroundCircle";

interface ScrollSectionProps {
  onScrollComplete?: () => void;
}

export default function ScrollSection({
  onScrollComplete,
}: ScrollSectionProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const isScrolling = useRef(false);
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      if (isScrolling.current) return;

      if (e.deltaY > 0) {
        // Scroll Down
        isScrolling.current = true;
        if (!showFinal) {
          if (wordIndex < rotatingWords.length - 1) {
            setWordIndex((prev) => prev + 1);
          } else {
            setShowFinal(true);
          }
        } else if (!showLogo) {
          setShowLogo(true);
        }
        setTimeout(() => {
          isScrolling.current = false;
        }, 500); // Debounce
      } else if (e.deltaY < 0) {
        // Scroll Up
        isScrolling.current = true;
        if (showLogo) {
          setShowLogo(false);
        } else if (showFinal) {
          setShowFinal(false);
        } else if (wordIndex > 0) {
          setWordIndex((prev) => prev - 1);
        }
        setTimeout(() => {
          isScrolling.current = false;
        }, 500); // Debounce
      }
    };

    // Touch support (basic Swipe)
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (isScrolling.current) return;
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0) {
          // Swipe Up / Scroll Down
          isScrolling.current = true;
          if (!showFinal) {
            if (wordIndex < rotatingWords.length - 1) {
              setWordIndex((prev) => prev + 1);
            } else {
              setShowFinal(true);
            }
          } else if (!showLogo) {
            setShowLogo(true);
          }
        } else {
          // Swipe Down / Scroll Up
          isScrolling.current = true;
          if (showLogo) {
            setShowLogo(false);
          } else if (showFinal) {
            setShowFinal(false);
          } else if (wordIndex > 0) {
            setWordIndex((prev) => prev - 1);
          }
        }
        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
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
  }, [wordIndex, showFinal, showLogo]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Main Interaction Area */}
        <main className="relative z-20 flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {!showFinal && !showLogo ? (
              <RotatingText wordIndex={wordIndex} words={rotatingWords} />
            ) : showFinal && !showLogo ? (
              <FinalReveal />
            ) : (
              <LogoScreen onNextClick={onScrollComplete} />
            )}
          </AnimatePresence>
        </main>

        {/* Animated Background */}
        <BackgroundCircle
          circleRef={circleRef}
          wordIndex={wordIndex}
          showFinal={showFinal}
          showLogo={showLogo}
          totalWords={rotatingWords.length}
        />
      </div>
    </div>
  );
}
