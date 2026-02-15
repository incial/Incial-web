import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import BrandingSlide from "@/app/components/features/services/BrandingSlide";

export default function ServicesSection() {
  const [showBranding, setShowBranding] = useState(false);
  const isScrolling = useRef(false);

  // Animation controls
  const textControls = useAnimation();
  const brandingControls = useAnimation();

  useEffect(() => {
    // Initial state
    textControls.set({ opacity: 1, y: 0 });
    brandingControls.set({ y: "100%", opacity: 0 });

    const handleScroll = async (e: WheelEvent) => {
      if (isScrolling.current) return;

      if (e.deltaY > 0 && !showBranding) {
        // Scroll Down -> Show Branding
        isScrolling.current = true;
        setShowBranding(true);

        await Promise.all([
          textControls.start({
            opacity: 0,
            y: -50,
            transition: { duration: 0.5 },
          }),
          brandingControls.start({
            y: "0%",
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" },
          }),
        ]);

        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      } else if (e.deltaY < 0 && showBranding) {
        // Scroll Up -> Show Intro
        isScrolling.current = true;
        setShowBranding(false);

        await Promise.all([
          brandingControls.start({
            y: "100%",
            opacity: 0,
            transition: { duration: 0.8, ease: "easeInOut" },
          }),
          textControls.start({
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, delay: 0.3 },
          }),
        ]);

        setTimeout(() => {
          isScrolling.current = false;
        }, 500);
      }
    };

    // Touch support
    let touchStartY = 0;
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
    };
    const handleTouchMove = async (e: TouchEvent) => {
      if (isScrolling.current) return;
      const touchEndY = e.touches[0].clientY;
      const deltaY = touchStartY - touchEndY;

      if (Math.abs(deltaY) > 50) {
        if (deltaY > 0 && !showBranding) {
          // Swipe Up / Scroll Down
          isScrolling.current = true;
          setShowBranding(true);
          await Promise.all([
            textControls.start({
              opacity: 0,
              y: -50,
              transition: { duration: 0.5 },
            }),
            brandingControls.start({
              y: "0%",
              opacity: 1,
              transition: { duration: 0.8, ease: "easeOut" },
            }),
          ]);
          setTimeout(() => {
            isScrolling.current = false;
          }, 500);
        } else if (deltaY < 0 && showBranding) {
          // Swipe Down / Scroll Up
          isScrolling.current = true;
          setShowBranding(false);
          await Promise.all([
            brandingControls.start({
              y: "100%",
              opacity: 0,
              transition: { duration: 0.8, ease: "easeInOut" },
            }),
            textControls.start({
              opacity: 1,
              y: 0,
              transition: { duration: 0.5, delay: 0.3 },
            }),
          ]);
          setTimeout(() => {
            isScrolling.current = false;
          }, 500);
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
  }, [showBranding, textControls, brandingControls]);

  return (
    <section className="h-screen w-full bg-black overflow-hidden relative">
      <div className="relative h-full w-full flex items-center justify-center">
        {/* Intro Text */}
        <motion.div
          animate={textControls}
          className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center z-10"
        >
          <h2 className="text-4xl font-bold text-white md:text-6xl">
            Services That Make Magic Happen
          </h2>
          <p className="mt-4 text-xl text-white/80 italic md:text-2xl">
            (And Seriously Grow Your Business)
          </p>
        </motion.div>

        {/* Branding Slide */}
        <motion.div
          animate={brandingControls}
          initial={{ y: "100%", opacity: 0 }}
          className="absolute inset-0 z-20"
        >
          <BrandingSlide />
        </motion.div>
      </div>
    </section>
  );
}
