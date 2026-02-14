"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { rotatingWords } from "@/app/lib/constants";

export default function ScrollSection() {
  const [wordIndex, setWordIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);
  const isScrolling = useRef(false);
  const circleRef = useRef(null);

  useEffect(() => {
    const handleScroll = (e: WheelEvent) => {
      // Prevent default scrolling to ensure "fixed" feel if necessary,
      // but usually 'passive: false' + preventDefault is needed for true scroll-jacking.
      // e.preventDefault();

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
        }
        setTimeout(() => {
          isScrolling.current = false;
        }, 500); // Debounce
      } else if (e.deltaY < 0) {
        // Scroll Up
        isScrolling.current = true;
        if (showFinal) {
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
          }
        } else {
          // Swipe Down / Scroll Up
          isScrolling.current = true;
          if (showFinal) {
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
  }, [wordIndex, showFinal]);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Center text */}
        <main className="relative z-20 flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {!showFinal ? (
              <motion.div
                key="phase-1-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
                className="flex w-full items-center justify-center gap-3 text-center"
              >
                <div className="text-4xl font-light text-white/90 md:text-5xl">
                  We <span className="italic">build</span>
                </div>
                <div className="text-left text-4xl font-bold text-white md:text-5xl">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={wordIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.25 }}
                    >
                      {rotatingWords[wordIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="final-text"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <div className="text-3xl font-light text-white/90 md:text-5xl">
                  We Are
                </div>
                <div className="mt-2 text-7xl font-bold leading-none text-white md:text-[120px]">
                  incial
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Circle — animated with scroll progress */}
        <motion.div
          ref={circleRef}
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
          initial={{ bottom: "-95%" }}
          animate={{
            bottom: showFinal
              ? "15%" // Moves up significantly for final state
              : `${-95 + (wordIndex / rotatingWords.length) * 80}%`, // Gradually moves up from -95% to ~-15%
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          style={{
            width: "min(1000px, 90vw)",
            height: "min(1000px, 90vw)",
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{ border: "1px solid rgba(100, 130, 200, 0.35)" }}
          />
        </motion.div>
      </div>
    </div>
  );
}
