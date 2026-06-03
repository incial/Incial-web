'use client';

import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import LogoScreen from '@/components/features/home/LogoScreen';

interface LandingIntroSequenceProps {
  playAnimation?: boolean;
  warmupOnly?: boolean;
  onComplete?: () => void;
  onStageChange?: (stage: string) => void;
}

const landingWords = ['Brand', 'Business', 'Beyond'];
const introStabilizationDelayMs = 180;
const brandHoldMs = 1400;
const businessHoldMs = 800;
const beyondHoldMs = 2200;
type SequenceStage = 'brand' | 'business' | 'beyond' | 'logo';
const sequenceStages: SequenceStage[] = ['brand', 'business', 'beyond'];

const AnimatedWord = memo(function AnimatedWord({
  word,
  isActive,
}: {
  word: string;
  isActive: boolean;
}) {
  return (
    <motion.span
      aria-hidden={!isActive}
      className="col-start-1 row-start-1 flex items-center justify-start whitespace-nowrap"
      initial={false}
      animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : 10 }}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1.0],
      }}
      style={{
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        willChange: 'opacity, transform',
      }}
    >
      {word}
    </motion.span>
  );
});

AnimatedWord.displayName = 'AnimatedWord';

export const LandingIntroSequence = memo(function LandingIntroSequence({
  playAnimation = false,
  warmupOnly = false,
  onComplete,
  onStageChange,
}: LandingIntroSequenceProps) {
  const initializedRef = useRef(false);
  const cancelledRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const introRafOneRef = useRef<number | null>(null);
  const introRafTwoRef = useRef<number | null>(null);
  const [stage, setStage] = useState<SequenceStage>(() =>
    warmupOnly || playAnimation ? 'brand' : 'logo',
  );
  const activeWordIndex = stage === 'brand' ? 0 : stage === 'business' ? 1 : stage === 'beyond' ? 2 : 0;

  useEffect(() => {
    if (onStageChange) {
      onStageChange(stage);
    }
  }, [stage, onStageChange]);

  const clearTimers = useCallback(() => {
    if (introRafOneRef.current !== null) {
      window.cancelAnimationFrame(introRafOneRef.current);
      introRafOneRef.current = null;
    }

    if (introRafTwoRef.current !== null) {
      window.cancelAnimationFrame(introRafTwoRef.current);
      introRafTwoRef.current = null;
    }

    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const advanceSequence = useCallback(function runSequence(stepIndex: number) {
    if (cancelledRef.current) return;

    const nextStage = sequenceStages[stepIndex];
    if (!nextStage) {
      setStage('logo');
      return;
    }

    setStage(nextStage);

    const holdTime =
      nextStage === 'brand'
        ? brandHoldMs
        : nextStage === 'business'
        ? businessHoldMs
        : beyondHoldMs;
    timerRef.current = window.setTimeout(() => {
      runSequence(stepIndex + 1);
    }, holdTime);
  }, []);

  useEffect(() => {
    if (!playAnimation || warmupOnly || initializedRef.current) {
      return;
    }

    initializedRef.current = true;
    cancelledRef.current = false;

    introRafOneRef.current = window.requestAnimationFrame(() => {
      introRafTwoRef.current = window.requestAnimationFrame(() => {
        if (cancelledRef.current) return;

        timerRef.current = window.setTimeout(() => {
          if (cancelledRef.current) return;
          advanceSequence(0);
        }, introStabilizationDelayMs);
      });
    });

    return () => {
      cancelledRef.current = true;
      clearTimers();
      initializedRef.current = false;
    };
  }, [advanceSequence, clearTimers, playAnimation, warmupOnly]);

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
      className="relative flex h-full w-full items-center justify-center overflow-hidden [contain:layout_paint_style]"
      style={{ 
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform, opacity',
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
              transform: 'translate3d(0, 0, 0)',
              backfaceVisibility: 'hidden',
              contain: 'layout paint style',
            }}
          >
            <div
              className="flex flex-row items-center justify-center gap-x-2.5 font-light text-white whitespace-nowrap overflow-hidden"
              style={{
                fontSize: 'clamp(1.75rem, 6.5vw, 3.5rem)',
                backfaceVisibility: 'hidden',
                transform: 'translate3d(0, 0, 0)',
              }}
            >
              <AnimatePresence mode="wait">
                {stage !== 'beyond' ? (
                  <motion.span
                    key="prefix-we-build"
                    initial={{ opacity: 1, x: 0 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                    className="inline-block"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'translate3d(0, 0, 0)',
                    }}
                  >
                    We <span className="italic">Build</span>
                  </motion.span>
                ) : (
                  <motion.span
                    key="prefix-and"
                    initial={{ opacity: 0, x: '100%' }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: '-100%' }}
                    transition={{
                      duration: 0.5,
                      ease: [0.25, 0.1, 0.25, 1.0],
                    }}
                    className="inline-block italic"
                    style={{
                      backfaceVisibility: 'hidden',
                      transform: 'translate3d(0, 0, 0)',
                    }}
                  >
                    And
                  </motion.span>
                )}
              </AnimatePresence>

              <span
                className="relative inline-grid min-w-[6.5ch] items-center justify-start text-left"
                style={{
                  contain: 'layout paint style',
                }}
              >
                {landingWords.map((word, index) => (
                  <AnimatedWord
                    key={word}
                    word={word}
                    isActive={index === activeWordIndex}
                  />
                ))}
              </span>
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
