'use client';

import { memo, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import LogoScreen from '@/components/features/home/LogoScreen';

interface LandingIntroSequenceProps {
  playAnimation?: boolean;
  warmupOnly?: boolean;
  onComplete?: () => void;
}

const landingWords = ['Brand', 'Business', 'Beyond'];
type SequenceStage = 'brand' | 'business' | 'beyond' | 'logo';

const getNextStage = (stage: SequenceStage): SequenceStage => {
  if (stage === 'brand') return 'business';
  if (stage === 'business') return 'beyond';
  return 'logo';
};

// Memoized word component to prevent re-renders
const WordDisplay = memo(({ word }: { word: string }) => (
  <motion.div
    key={word}
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1.0],
    }}
    style={{ transform: 'translateZ(0)' }}
  >
    {word}
  </motion.div>
));

WordDisplay.displayName = 'WordDisplay';

export const LandingIntroSequence = memo(function LandingIntroSequence({
  playAnimation = false,
  warmupOnly = false,
  onComplete,
}: LandingIntroSequenceProps) {
  const timerRef = useRef<number | null>(null);
  const [stage, setStage] = useState<SequenceStage>(() =>
    warmupOnly || playAnimation ? 'brand' : 'logo',
  );
  const isFirstRenderRef = useRef(true);

  const currentWord = useMemo(() => {
    if (stage === 'brand') return landingWords[0];
    if (stage === 'business') return landingWords[1];
    if (stage === 'beyond') return landingWords[2];
    return landingWords[0];
  }, [stage]);

  // Stage progression with extended hold ONLY for first state
  // Brand: 1500ms (extra 300ms for mobile render stability)
  // Business & Beyond: 1200ms each (original timing)
  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!playAnimation || warmupOnly || stage === 'logo') {
      return;
    }

    // ONLY the first state gets extended hold time
    // This ensures "We Build Brand" is fully visible on mobile before transition
    const isFirstState = isFirstRenderRef.current && stage === 'brand';
    const holdTime = isFirstState ? 1500 : 1200; // +300ms only for Brand state

    if (isFirstState) {
      isFirstRenderRef.current = false;
    }

    timerRef.current = window.setTimeout(() => {
      setStage((currentStage) => getNextStage(currentStage));
    }, holdTime);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playAnimation, warmupOnly, stage]);

  // Memoized completion callback
  const handleComplete = useCallback(() => {
    onComplete?.();
  }, [onComplete]);

  useEffect(() => {
    if (stage !== 'logo' || !playAnimation || warmupOnly) return;
    handleComplete();
  }, [stage, playAnimation, warmupOnly, handleComplete]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black [contain:layout_paint_style]"
      style={{ 
        transform: 'translateZ(0)', 
        willChange: 'contents',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
      }}
    >
      <AnimatePresence mode="wait">
        {stage !== 'logo' ? (
          <motion.div
            key="mobile-landing-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="relative z-20 flex w-full flex-col items-center justify-center gap-1 px-4 text-center"
            style={{ 
              willChange: 'transform, opacity', 
              transform: 'translateZ(0)',
              backfaceVisibility: 'hidden',
            }}
          >
            <div
              className="font-light text-white/90"
              style={{ fontSize: 'clamp(2rem, 7.5vw, 4rem)' }}
            >
              We <span className="italic">Build</span>
            </div>
            <div
              className="font-bold text-white"
              style={{ fontSize: 'clamp(2rem, 7.5vw, 4rem)' }}
            >
              <AnimatePresence mode="wait">
                <WordDisplay word={currentWord} />
              </AnimatePresence>
            </div>
          </motion.div>
        ) : (
          <LogoScreen
            key="mobile-landing-logo"
            skipAnimation={!playAnimation}
            sizeMode="mobile"
          />
        )}
      </AnimatePresence>
    </div>
  );
});
