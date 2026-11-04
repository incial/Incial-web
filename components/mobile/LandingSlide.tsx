'use client';

import { useState, useCallback, useEffect, useMemo, useRef, memo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MobileSlide } from './MobileSlide';
import { LandingIntroSequence } from './LandingIntroSequence';

interface LandingSlideProps {
  onNavigate?: (section: string) => void;
  playLogoAnimation?: boolean;
  warmupOnly?: boolean;
  id?: string;
  onInView?: (id: string) => void;
  onIntroComplete?: () => void;
  onStageChange?: (stage: string) => void;
}

/** The logo takes about this long to draw and fade in; the buttons wait for it. */
const CONTROLS_AFTER_LOGO_MS = 2600;
/** The buttons slide in from below the screen, and slide back down while the logo turns to dust. */
const CONTROLS_SLIDE_PX = 280;

const navTargets: Record<string, string> = {
  about: '/about',
  works: '/pdf/Brochure.pdf',
  products: '/products',
};

// Memoized CTA Button component
const CTAButton = memo(
  ({ label, action, onClick }: { label: string; action: string; onClick: (action: string) => void }) => {
    return (
      <motion.button
        onClick={() => onClick(action)}
        whileTap={{ scale: 0.98 }}
        className="rounded-full border border-white/80 flex items-center justify-center px-7 py-3.5 text-[12px] font-medium text-white whitespace-nowrap transition-colors hover:bg-white hover:text-black active:bg-white active:text-black text-center leading-tight"
        style={{ transform: 'translateZ(0)' }}
      >
        {label}
      </motion.button>
    );
  }
);

CTAButton.displayName = 'CTAButton';

export const LandingSlide = memo(function LandingSlide({
  onNavigate,
  playLogoAnimation = false,
  warmupOnly = false,
  id,
  onInView,
  onIntroComplete,
  onStageChange,
}: LandingSlideProps) {
  const router = useRouter();
  // The buttons wait for the logo: they only appear once the intro has finished and the logo is in.
  const [showControls, setShowControls] = useState(false);

  // Memoize navigation targets
  const memoizedNavTargets = useMemo(() => navTargets, []);

  // Optimized CTA handler with less re-renders
  const handleCTA = useCallback((action: string) => {
    if (onNavigate) {
      onNavigate(action);
      return;
    }

    const target = memoizedNavTargets[action];
    if (target) {
      router.push(target);
    }
  }, [onNavigate, memoizedNavTargets, router]);

  // Optimized sequence complete handler
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSequenceComplete = useCallback(() => {
    onIntroComplete?.();
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(true), CONTROLS_AFTER_LOGO_MS);
  }, [onIntroComplete]);

  useEffect(
    () => () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    },
    [],
  );

  // Memoize sequence key to prevent unnecessary re-renders
  const sequenceKey = useMemo(
    () => `${playLogoAnimation ? 'active' : 'idle'}-${warmupOnly ? 'warmup' : 'live'}`,
    [playLogoAnimation, warmupOnly]
  );

  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="relative w-full h-full overflow-hidden" style={{ transform: 'translateZ(0)' }}>
        {/* Post-preloader intro animation - takes full slide area to center correctly */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center z-10">
          <LandingIntroSequence
            key={sequenceKey}
            playAnimation={playLogoAnimation}
            warmupOnly={warmupOnly}
            onComplete={handleSequenceComplete}
            onStageChange={onStageChange}
          />
        </div>

        {/* Bottom Section - absolute positioned to overlay without shifting layout */}
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            translate: `0 calc(var(--landing-shift, 0) * ${CONTROLS_SLIDE_PX}px)`,
          }}
        >
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: CONTROLS_SLIDE_PX }}
              animate={{ y: 0 }}
              exit={{ y: CONTROLS_SLIDE_PX }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] mb-[50px] flex flex-col items-center z-20"
              style={{ willChange: 'transform', backfaceVisibility: 'hidden' }}
            >
              {/* Divider */}
              <div className="h-[1px] w-full bg-white/40" />

              {/* CTA Buttons */}
              <div className="flex w-full items-center justify-center pt-4 gap-3">
                <CTAButton label="About Us" action="about" onClick={handleCTA} />
                <CTAButton label="Our Works" action="works" onClick={handleCTA} />
              </div>
              <div className="flex w-full items-center justify-center pt-3">
                <CTAButton label="Our Products" action="products" onClick={handleCTA} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </MobileSlide>
  );
});

