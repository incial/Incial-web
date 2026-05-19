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
}

const navTargets: Record<string, string> = {
  about: '/about',
  works: '/pdf/Brochure.pdf',
  products: '/products',
};

// Memoized CTA Button component
const CTAButton = memo(
  ({ label, action, onClick }: { label: string; action: string; onClick: (action: string) => void }) => (
    <motion.button
      onClick={() => onClick(action)}
      whileTap={{ scale: 0.98 }}
      className="rounded-full border border-white/80 px-[24px] py-[11px] text-[12px] font-medium text-white transition-colors hover:bg-white hover:text-black active:bg-white active:text-black"
      style={{ transform: 'translateZ(0)' }}
    >
      {label}
    </motion.button>
  )
);

CTAButton.displayName = 'CTAButton';

export const LandingSlide = memo(function LandingSlide({
  onNavigate,
  playLogoAnimation = false,
  warmupOnly = false,
  id,
  onInView,
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
  }, []);

  // Memoize sequence key to prevent unnecessary re-renders
  const sequenceKey = useMemo(
    () => `${playLogoAnimation ? 'active' : 'idle'}-${warmupOnly ? 'warmup' : 'live'}`,
    [playLogoAnimation, warmupOnly]
  );

  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="w-full h-full flex flex-col items-center justify-between px-6 pb-8 pt-8" style={{ transform: 'translateZ(0)' }}>
        {/* Post-preloader intro animation */}
        <div className="flex flex-1 items-center justify-center w-full">
          <div className="relative h-full w-full" style={{ contain: 'layout style paint' }}>
            <LandingIntroSequence
              key={sequenceKey}
              playAnimation={playLogoAnimation}
              warmupOnly={warmupOnly}
              onComplete={handleSequenceComplete}
            />
          </div>
        </div>

        {/* Bottom Section */}
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className="w-[96%] max-w-[370px] mb-[45px] flex flex-col items-center"
              style={{ transform: 'translateZ(0)', backfaceVisibility: 'hidden' }}
            >
              {/* Divider */}
              <div className="h-[1px] w-full bg-white/40" />

              {/* CTA Buttons */}
              <div className="flex w-full items-center justify-between pt-6 gap-2">
                <CTAButton label="About Us" action="about" onClick={handleCTA} />
                <CTAButton label="Our Works" action="works" onClick={handleCTA} />
                <CTAButton label="Our Products" action="products" onClick={handleCTA} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileSlide>
  );
});

