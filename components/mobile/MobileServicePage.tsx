'use client';

import { useState, useCallback, useTransition, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MobileLayout } from './MobileLayout';
import { MobilePreloader } from './MobilePreloader';
import { LandingSlide } from './LandingSlide';
import { IntroSlide } from './IntroSlide';
import { StatsSlide } from './StatsSlide';
import { ClientsSlide } from './ClientsSlide';
import { ContactSlide } from './ContactSlide';
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
  const [, setDisplaySlide] = useState("landing");

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

  // Smooth slide navigation helper
  const scrollToSlide = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Effect to handle direct scrolling to hash targets (services, contact) on mobile
  useEffect(() => {
    if (activeHash === "services" || activeHash === "contact") {
      requestAnimationFrame(() => {
        setHasLandingIntroCompleted(true);
      });
      const timer = setTimeout(() => {
        const targetId = activeHash === "services" ? "services" : "contact";
        scrollToSlide(targetId);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [activeHash, scrollToSlide]);

  // Debounced handler for slide changes
  const handleActiveSlideChange = useCallback((slideId: string) => {
    activeSlideDeferredRef.current = slideId;
    startTransition(() => {
      setDisplaySlide(slideId);
    });
  }, [startTransition]);

  const slideProps = (id: string) => ({
    id,
    onInView: handleActiveSlideChange,
  });

  const isIntroActive = !hasLandingIntroCompleted && introStage !== 'logo';
  const hideHeader = isPreloading || isIntroActive;

  const backgroundLayer = useMemo(() => {
    const activeWordIndex = introStage === 'brand' ? 0 : introStage === 'business' ? 1 : introStage === 'beyond' ? 2 : 0;
    const progress = activeWordIndex / 2;

    return (
      <div className="absolute inset-0 w-full h-full pointer-events-none" style={{ contain: 'layout style paint' }}>
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
      </div>
    );
  }, [introStage, isPreloading]);

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

          {/* Services Overview / Intro Slide — detail panels open inline on card tap */}
          <IntroSlide onNavigate={scrollToSlide} {...slideProps("services")} />

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