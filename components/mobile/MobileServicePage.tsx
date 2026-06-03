'use client';

import { useState, useCallback, useTransition, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from './MobileLayout';
import { MobilePreloader } from './MobilePreloader';
import { LandingSlide } from './LandingSlide';
import { IntroSlide } from './IntroSlide';
import { BrandingSlide } from './BrandingSlide';
import { TechnologySlide } from './TechnologySlide';
import { ExperienceSlide } from './ExperienceSlide';
import { StatsSlide } from './StatsSlide';
import { ClientsSlide } from './ClientsSlide';
import { ContactSlide } from './ContactSlide';
import { MobileArtboard } from './MobileArtboard';
import RotatingEarth from '@/components/features/home/RotatingEarth';

interface MobileServicePageProps {
  skipPreloader?: boolean;
  activeHash?: string;
}

export const MobileServicePage = ({ skipPreloader = false, activeHash }: MobileServicePageProps) => {
  const [isPreloading, setIsPreloading] = useState(!skipPreloader);
  const [hasLandingIntroCompleted, setHasLandingIntroCompleted] = useState(() => {
    return skipPreloader && activeHash === "services";
  });
  const [introStage, setIntroStage] = useState<string>(() => {
    if (skipPreloader && activeHash === "services") return 'logo';
    return skipPreloader ? 'logo' : 'pre';
  });

  useEffect(() => {
    if (skipPreloader) return;
    const isDone = typeof window !== "undefined" && sessionStorage.getItem("initial-load-done");
    if (isDone) {
      setIsPreloading(false);
      setHasLandingIntroCompleted(true);
      setIntroStage('logo');
    }
  }, [skipPreloader]);
  const [, startTransition] = useTransition();
  
  // Ref-based tracking to avoid unnecessary re-renders
  const activeSlideDeferredRef = useRef("landing");
  const [displaySlide, setDisplaySlide] = useState("landing");

  const shouldShowPreloader = !skipPreloader && isPreloading;
  const shouldPlayLandingAnimation = !isPreloading || skipPreloader;
  const isScrollLocked = shouldPlayLandingAnimation && !hasLandingIntroCompleted;

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloading(false);
    sessionStorage.setItem("initial-load-done", "true");
    setIntroStage('brand');
  }, []);

  const handleLandingIntroComplete = useCallback(() => {
    setHasLandingIntroCompleted(true);
  }, []);

  // Effect to handle direct scrolling to the services section (IntroSlide) on mobile
  useEffect(() => {
    if (activeHash === "services") {
      requestAnimationFrame(() => {
        setHasLandingIntroCompleted(true);
      });
      // Wait for a short moment to ensure the layout has updated and scroll lock is disabled
      const timer = setTimeout(() => {
        const element = document.getElementById("intro");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeHash]);

  // Debounced handler for slide changes
  const handleActiveSlideChange = useCallback((slideId: string) => {
    // Update ref immediately (no render)
    activeSlideDeferredRef.current = slideId;
    
    // Defer the state update to prevent frame drops during scroll
    startTransition(() => {
      setDisplaySlide(slideId);
    });
  }, [startTransition]);

  const slideProps = (id: string) => ({
    id,
    onInView: handleActiveSlideChange,
  });

  // Memoize variants to prevent object recreation on every render
  const circleVariants = useMemo(() => ({
    landing: { opacity: 0, x: 159, y: 430, scale: 3.95, transition: { duration: 0 } },
    intro: { opacity: 0, x: 159, y: 430, scale: 3.95, transition: { duration: 0 } },
    branding: { opacity: 1, x: 159, y: 430, scale: 3.95, transition: { duration: 0.1 } },
    technology: { opacity: 1, x: 195, y: 76, scale: 3.14 },
    experience: { opacity: 1, x: 690, y: 390, scale: 4.00 },
    stats: { opacity: 0, x: 690, y: 390, scale: 4.00 },
    clients: { opacity: 0, x: 690, y: 390, scale: 4.00 },
    contact: { opacity: 0, x: 690, y: 390, scale: 4.00 },
  }), []);

  const isIntroActive = !hasLandingIntroCompleted && introStage !== 'logo';
  const hideHeader = isPreloading || isIntroActive;

  const backgroundLayer = useMemo(() => {
    const activeWordIndex = introStage === 'brand' ? 0 : introStage === 'business' ? 1 : introStage === 'beyond' ? 2 : 0;
    const progress = activeWordIndex / 2;

    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ contain: 'layout style paint' }}>
        {/* 3D Rotating Earth Globe Background */}
        <AnimatePresence>
          {!isPreloading && introStage !== 'logo' && introStage !== 'pre' && (
            <motion.div
              key="mobile-rotating-globe"
              initial={{ x: "-50%", y: "120%", opacity: 0 }}
              animate={{
                x: "-50%",
                y: `${120 - progress * 170}%`,
                opacity: 0.8,
              }}
              exit={{ x: "-50%", y: "120%", opacity: 0 }}
              transition={{
                duration: 1.2,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="absolute left-1/2 top-1/2"
              style={{
                width: "80%",
                aspectRatio: "1/1",
                willChange: "transform, opacity",
              }}
            >
              <RotatingEarth className="w-full h-full" width={700} height={700} />
            </motion.div>
          )}
        </AnimatePresence>

        <MobileArtboard baseWidth={390} baseHeight={620} clipContent={false}>
          <motion.svg 
            viewBox="0 0 390 780" 
            className="absolute inset-0 h-full w-full pointer-events-none"
            style={{ 
              overflow: 'visible',
              willChange: 'auto',
              transform: 'translateZ(0)', // Force GPU acceleration
            }}
          >
            <motion.circle
              cx={0}
              cy={0}
              r={100}
              stroke="#D8E8FF"
              strokeWidth="2"
              fill="none"
              vectorEffect="non-scaling-stroke"
              style={{ 
                willChange: 'auto',
              }}
              animate={displaySlide}
              initial="landing"
              variants={circleVariants}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            />
          </motion.svg>
        </MobileArtboard>
      </div>
    );
  }, [introStage, displaySlide, circleVariants, isPreloading]);

  return (
    <>
      <div className={`w-full h-full ${shouldShowPreloader ? 'pointer-events-none' : ''}`} aria-hidden={shouldShowPreloader}>
        <MobileLayout backgroundLayer={backgroundLayer} scrollLocked={isScrollLocked} hideHeader={hideHeader}>
          {/* Landing Slide */}
          <LandingSlide
            playLogoAnimation={shouldPlayLandingAnimation}
            warmupOnly={!skipPreloader && isPreloading}
            onIntroComplete={handleLandingIntroComplete}
            onStageChange={setIntroStage}
            {...slideProps("landing")}
          />

          {/* Intro Slide */}
          <IntroSlide {...slideProps("intro")} />

          {/* Branding Slide */}
          <BrandingSlide {...slideProps("branding")} />

          {/* Technology Slide */}
          <TechnologySlide {...slideProps("technology")} />

          {/* Experience Slide */}
          <ExperienceSlide {...slideProps("experience")} />

          {/* Stats Slide */}
          <StatsSlide {...slideProps("stats")} />

          {/* Clients Slide */}
          <ClientsSlide {...slideProps("clients")} />

          {/* Contact Slide */}
          <ContactSlide {...slideProps("contact")} />
        </MobileLayout>
      </div>

      {shouldShowPreloader && <MobilePreloader onComplete={handlePreloaderComplete} />}
    </>
  );
};