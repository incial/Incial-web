'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
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

export const LandingIntroSequence = memo(function LandingIntroSequence({
  playAnimation = false,
  warmupOnly = false,
  onComplete,
}: LandingIntroSequenceProps) {
  const timerRef = useRef<number | null>(null);
  const [stage, setStage] = useState<SequenceStage>(() =>
    warmupOnly || playAnimation ? 'brand' : 'logo',
  );

  const currentWord = useMemo(() => {
    if (stage === 'brand') return landingWords[0];
    if (stage === 'business') return landingWords[1];
    if (stage === 'beyond') return landingWords[2];
    return landingWords[0];
  }, [stage]);

  useEffect(() => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (!playAnimation || warmupOnly || stage === 'logo') {
      return;
    }

    timerRef.current = window.setTimeout(() => {
      setStage((currentStage) => getNextStage(currentStage));
    }, 1500);

    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playAnimation, warmupOnly, stage]);

  useEffect(() => {
    if (stage !== 'logo' || !playAnimation || warmupOnly) return;
    onComplete?.();
  }, [onComplete, playAnimation, stage, warmupOnly]);

  return (
    <div
      className="relative flex h-full w-full items-center justify-center overflow-hidden bg-black [contain:layout_paint_style]"
    >
      <AnimatePresence mode="wait">
        {stage !== 'logo' ? (
          <motion.div
            key="mobile-landing-text"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -20, transition: { duration: 0.3 } }}
            className="relative z-20 flex w-full flex-col items-center justify-center gap-1 px-4 text-center"
            style={{ willChange: 'transform, opacity' }}
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
                <motion.div
                  key={stage}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.1, 0.25, 1.0],
                  }}
                >
                  {currentWord}
                </motion.div>
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