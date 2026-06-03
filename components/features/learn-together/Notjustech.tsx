'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
  hideNav?: boolean;
}

const Notjustech = ({ onNext, onPrev, hideNav }: SlideProps) => {
  const [showRing, setShowRing] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShowRing(true), 300);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black px-6 sm:px-10 md:px-16 lg:px-24 font-['Poppins',sans-serif]">
      <div className="relative z-10 mx-auto flex w-full max-w-[1400px] items-center justify-center">
        <AnimatePresence>
          {showRing && (
            <motion.svg
              className="h-[360px] w-[360px] sm:h-[420px] sm:w-[420px]"
              viewBox="0 0 360 360"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.circle
                cx="180"
                cy="180"
                r="128"
                stroke="rgba(230, 120, 120, 0.85)"
                strokeWidth="2"
                fill="none"
                pathLength={1}
                initial={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
                animate={{ strokeDasharray: 1, strokeDashoffset: 0, opacity: 1 }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
              <motion.circle
                cx="180"
                cy="180"
                r="40"
                stroke="rgba(230, 120, 120, 0.9)"
                strokeWidth="2"
                fill="none"
                pathLength={1}
                initial={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0 }}
                animate={{ strokeDasharray: 1, strokeDashoffset: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
              />
            </motion.svg>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 flex items-center justify-center text-center">
          <div className="text-white">
            <p className="text-[clamp(1.4rem,3vw,2rem)] font-semibold tracking-tight">
              It&apos;s Not Just Teaching
            </p>
          </div>
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

export default Notjustech;
