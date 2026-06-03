
'use client';

import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
  hideNav?: boolean;
}

const Whatwexlpore = ({ onNext, onPrev, hideNav }: SlideProps) => {
  const [showCircle, setShowCircle] = useState(false);

  const circleTraceTransitions: Transition = {
    duration: 0.95,
    ease: [0.22, 1, 0.36, 1],
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowCircle(true), 350);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full bg-black px-6 sm:px-10 md:px-16 lg:px-24 font-['Poppins',sans-serif]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col items-center">
        <motion.h2
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mt-16 text-center text-[clamp(2.4rem,6vw,4.6rem)] font-semibold tracking-tight text-white"
        >
          What We Explore
        </motion.h2>

        <div className="relative mt-10 flex w-full max-w-[640px] items-center justify-center">
          <AnimatePresence>
            {showCircle && (
              <motion.svg
                className="h-[320px] w-[320px] sm:h-[360px] sm:w-[360px]"
                viewBox="0 0 360 360"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.circle
                  cx="180"
                  cy="180"
                  r="44"
                  stroke="rgba(115, 210, 140, 0.75)"
                  strokeWidth="2"
                  fill="none"
                  pathLength={1}
                  initial={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
                  animate={{ strokeDasharray: 1, strokeDashoffset: 0, opacity: 1 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                />
                <motion.circle
                  cx="180"
                  cy="180"
                  r="120"
                  stroke="rgba(115, 210, 140, 0.65)"
                  strokeWidth="2"
                  fill="none"
                  pathLength={1}
                  initial={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
                  animate={{ strokeDasharray: 1, strokeDashoffset: 0, opacity: 1 }}
                  transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
                />
                <motion.line
                  x1="180"
                  y1="300"
                  x2="180"
                  y2="300"
                  stroke="rgba(115, 210, 140, 0.75)"
                  strokeWidth="2"
                  initial={{ opacity: 0 }}
                  animate={{ y1: 300, y2: 6000, opacity: 1 }}
                  transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
                />
              </motion.svg>
            )}
          </AnimatePresence>
        </div>
      </div>

      {!hideNav && (
        <div className="absolute bottom-6 right-6 flex flex-col gap-4 text-white/50">
          <motion.button
            whileHover={{ scale: 1.2, color: '#fff' }}
            onClick={onPrev}
            className="p-2 transition-colors"
          >
            <ArrowUp size={28} strokeWidth={2} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.2, color: '#fff' }}
            onClick={onNext}
            className="p-2 transition-colors"
          >
            <ArrowDown size={28} strokeWidth={2} />
          </motion.button>
        </div>
      )}
    </div>
  );
};

export default Whatwexlpore;
