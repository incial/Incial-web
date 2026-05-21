'use client';

import { useState, useCallback, useTransition, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
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

interface MobileServicePageProps {
  skipPreloader?: boolean;
}

export const MobileServicePage = ({ skipPreloader = false }: MobileServicePageProps) => {
  const [isPreloading, setIsPreloading] = useState(true);
  const [, startTransition] = useTransition();
  
  // Ref-based tracking to avoid unnecessary re-renders
  const activeSlideDeferredRef = useRef("landing");
  const [displaySlide, setDisplaySlide] = useState("landing");

  const shouldShowPreloader = !skipPreloader && isPreloading;
  const shouldPlayLandingAnimation = !isPreloading || skipPreloader;

  const handlePreloaderComplete = useCallback(() => {
    setIsPreloading(false);
  }, []);

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

  const backgroundLayer = useMemo(() => (
    <div className="absolute inset-0 h-[calc(100dvh-110px)] top-[110px] pointer-events-none" style={{ contain: 'layout style paint' }}>
      <MobileArtboard baseWidth={390} baseHeight={620}>
        <motion.svg 
          viewBox="0 0 390 780" 
          className="absolute inset-0 h-full w-full pointer-events-none"
          style={{ 
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
  ), [displaySlide, circleVariants]);

  return (
    <>
      <div className={shouldShowPreloader ? 'pointer-events-none' : ''} aria-hidden={shouldShowPreloader}>
        <MobileLayout backgroundLayer={backgroundLayer}>
          {/* Landing Slide */}
          <LandingSlide
            playLogoAnimation={shouldPlayLandingAnimation}
            warmupOnly={!skipPreloader && isPreloading}
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