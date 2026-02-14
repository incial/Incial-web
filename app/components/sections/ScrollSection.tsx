"use client";

import { useRef, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { rotatingWords } from "@/app/lib/constants";

gsap.registerPlugin(ScrollTrigger);

export default function ScrollSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const circleRef = useRef<HTMLDivElement>(null);
  const [wordIndex, setWordIndex] = useState(0);
  const [showFinal, setShowFinal] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const circle = circleRef.current;
    if (!container || !circle) return;

    // Small delay to let the slide-in animation finish before GSAP measures
    const timer = setTimeout(() => {
      const ctx = gsap.context(() => {
        // Circle starts at bottom (top arc peeking), rises up and scales
        gsap.fromTo(
          circle,
          { bottom: "-95%", scale: 1 },
          {
            bottom: "5%",
            scale: 1.3,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top top",
              end: "bottom bottom",
              scrub: true,
            },
          }
        );

        // Word changes based on scroll position
        const totalWords = rotatingWords.length;
        const wordRange = 0.8;
        const segmentSize = wordRange / totalWords;

        for (let i = 0; i < totalWords; i++) {
          ScrollTrigger.create({
            trigger: container,
            start: () =>
              `top+=${i * segmentSize * (container.scrollHeight - window.innerHeight)}px top`,
            end: () =>
              `top+=${(i + 1) * segmentSize * (container.scrollHeight - window.innerHeight)}px top`,
            onEnter: () => {
              setShowFinal(false);
              setWordIndex(i);
            },
            onEnterBack: () => {
              setShowFinal(false);
              setWordIndex(i);
            },
          });
        }

        // Final state: "We Are incial"
        ScrollTrigger.create({
          trigger: container,
          start: () =>
            `top+=${0.82 * (container.scrollHeight - window.innerHeight)}px top`,
          end: "bottom bottom",
          onEnter: () => setShowFinal(true),
          onLeaveBack: () => {
            setShowFinal(false);
            setWordIndex(totalWords - 1);
          },
        });
      }, container);

      return () => ctx.revert();
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={containerRef} className="relative" style={{ height: "500vh" }}>
      <div className="sticky top-0 flex h-screen flex-col overflow-hidden">
        {/* Center text */}
        <main className="relative z-20 flex flex-1 items-center justify-center">
          <AnimatePresence mode="wait">
            {!showFinal ? (
              <motion.div
                key={`build-${wordIndex}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="text-center"
              >
                <span className="text-4xl font-light text-white/90 md:text-5xl">
                  We{" "}
                </span>
                <span className="text-4xl font-light italic text-white/90 md:text-5xl">
                  build
                </span>
                <span className="text-4xl md:text-5xl">&nbsp;&nbsp;</span>
                <span className="text-4xl font-bold text-white md:text-5xl">
                  {rotatingWords[wordIndex]}
                </span>
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

        {/* Circle — starts at bottom with top arc visible, rises with scroll */}
        <div
          ref={circleRef}
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
          style={{
            width: "min(1000px, 90vw)",
            height: "min(1000px, 90vw)",
            bottom: "-90%",
          }}
        >
          <div
            className="h-full w-full rounded-full"
            style={{ border: "1px solid rgba(100, 130, 200, 0.35)" }}
          />
        </div>
      </div>
    </div>
  );
}
