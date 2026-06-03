'use client';

import { useState, useCallback, useMemo, memo } from 'react';
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

const navTargets: Record<string, string> = {
  about: '/about',
  works: '/pdf/Brochure.pdf',
  products: '/products',
};

// Memoized CTA Button component
const CTAButton = memo(
  ({ label, action, onClick }: { label: string; action: string; onClick: (action: string) => void }) => {
    const formattedLabel = label.split(' ').map((word, index) => (
      <span key={index} className="block">
        {word}
      </span>
    ));

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
  const [showControls, setShowControls] = useState(!playLogoAnimation);

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
  const handleSequenceComplete = useCallback(() => {
    setShowControls(true);
    onIntroComplete?.();
  }, [onIntroComplete]);

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
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] mb-[50px] flex flex-col items-center z-20"
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
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
    </MobileSlide>
  );
});

