'use client';

import { motion, AnimatePresence, type Transition } from 'framer-motion';
import { ArrowUp, ArrowDown } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SlideProps {
  onNext?: () => void;
  onPrev?: () => void;
  hideNav?: boolean;
}

export default function Itstartedwith({ onNext, onPrev, hideNav }: SlideProps) {
  const [showFull, setShowFull] = useState(false);

  const circleTraceTransitions: Transition = {
    duration: 0.9,
    ease: [0.22, 1, 0.36, 1],
    delay: 0.15,
  };

  useEffect(() => {
    const timer = window.setTimeout(() => setShowFull(true), 900);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="relative flex min-h-screen w-full bg-black overflow-hidden px-6 sm:px-10 md:px-16 lg:px-24 font-['Poppins',sans-serif]">
      <AnimatePresence>
        {showFull && (
          <motion.div
            className="pointer-events-none absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <motion.svg
              className="absolute inset-0 h-full w-full"
              viewBox="0 0 1200 1200"
              preserveAspectRatio="xMidYMid slice"
              initial={{ x: 200, scale: 0.8, opacity: 0.6 }}
              animate={{ x: 300, scale: 1, opacity: 1 }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
              style={{ transformOrigin: '78% 50%' }}
            >
              <defs>
                <clipPath id="circleRevealClip">
                  <motion.rect
                    x="0"
                    width="1200"
                    height="1200"
                    initial={{ y: 2000 }}
                    animate={{ y: 0 }}
                    transition={circleTraceTransitions}
                  />
                </clipPath>
              </defs>
              <g clipPath="url(#circleRevealClip)">
                <circle cx="940" cy="600" r="200" stroke="rgba(196, 181, 253, 0.25)" strokeWidth="2" fill="none" />
                <circle cx="1010" cy="600" r="400" stroke="rgba(196, 181, 253, 0.25)" strokeWidth="1" fill="none" />
                <circle cx="720" cy="600" r="450" stroke="rgba(196, 181, 253, 0.15)" strokeWidth="1" fill="none" />
              </g>
            </motion.svg>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        layout
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className={
          showFull
            ? 'relative z-10 w-full max-w-[1440px] self-center'
            : 'relative z-10 w-full max-w-[520px] self-end mb-10'
        }
      >
        <motion.div
          layout
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className={
            showFull
              ? 'grid w-full grid-cols-1 gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12'
              : 'grid w-full grid-cols-1 gap-0'
          }
        >
          <div className="flex flex-col items-start">
            <motion.h2
              layout
              initial="hidden"
              animate={showFull ? 'static' : 'visible'}
              variants={{
                hidden: { opacity: 1 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.05 },
                },
                static: { opacity: 1 },
              }}
              transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="text-[clamp(2.6rem,6.8vw,5.4rem)] font-bold leading-[0.95] tracking-tight text-white"
            >
              {['It', 'Started', 'With', 'Curiosity.'].map((line) => (
                <motion.span
                  key={line}
                  className="block"
                  variants={{
                    hidden: { opacity: 0, y: 22 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
                    static: { opacity: 1, y: 0 },
                  }}
                >
                  {line}
                </motion.span>
              ))}
            </motion.h2>

            <AnimatePresence>
              {showFull && (
                <motion.div
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 22 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                >
                  <p className="mt-6 max-w-xl text-base text-white/85 md:text-lg">
                    LearnTogether began the same way Incial began, with a group of curious
                    minds sitting together, experimenting, building, and figuring things out.
                  </p>
                  <p className="mt-5 max-w-xl text-sm text-white/60 md:text-base">
                    That spirit evolved into LearnTogether, a structured space for practical,
                    collaborative skill-building.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {showFull && (
              <motion.div
                className="flex flex-col items-start justify-center text-left lg:items-end lg:text-right"
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 22 }}
                transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              >
                <div className="space-y-3 text-lg font-medium text-violet-200 md:text-xl">
                  <p>No large classrooms.</p>
                  <p>No rigid systems.</p>
                  <p>Just people learning by doing.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

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
      </motion.div>
    </div>
  );
}
