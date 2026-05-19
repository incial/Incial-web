'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { MobileSlide } from '../MobileSlide';

interface SlideProps {
  id: string;
  onInView: (id: string) => void;
}

// Floating element component for mobile layout
const FloatingElement = ({
  icon,
  top,
  left,
  size = 'md',
}: {
  icon: string;
  top: string;
  left: string;
  size?: 'sm' | 'md' | 'lg';
}) => {
  const sizeClasses: Record<string, string> = {
    sm: 'text-3xl w-10 h-10',
    md: 'text-4xl w-12 h-12',
    lg: 'text-5xl w-16 h-16',
  };

  // Icons are static for performance; no per-icon animations.
  return (
    <div className="absolute pointer-events-none" style={{ top, left }}>
      <div
        className={`${sizeClasses[size]} flex items-center justify-center drop-shadow-2xl`}
        style={{ filter: 'drop-shadow(0 10px 30px rgba(0,0,0,0.45))' }}
      >
        {icon}
      </div>
    </div>
  );
};

export const LearnLandingSlide = ({ id, onInView }: SlideProps) => {
  const reduce = useReducedMotion();

  return (
    <MobileSlide id={id} onInView={onInView}>
      <motion.div
        initial={reduce ? { scale: 1, opacity: 1 } : { scale: 0.12, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={reduce ? { duration: 0 } : { duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="relative flex h-full w-full flex-col items-center justify-center bg-black font-['Poppins',sans-serif] text-white"
      >

        {/* Subtle background glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,80,160,0.08),transparent_50%)]" />

        {/* Burst Animation (centered) */}
        {reduce ? (
          <div
            className="absolute left-1/2 top-1/2 z-0 h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.06), rgba(255,255,255,0) 40%)' }}
          />
        ) : (
          <motion.div
            initial={{ opacity: 1, scale: 0 }}
            animate={{ opacity: 0, scale: 4 }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="absolute left-1/2 top-1/2 z-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle at center, rgba(255,255,255,0.16), rgba(255,255,255,0) 40%)' }}
          />
        )}

        {/* Floating elements positioned for mobile design */}
        <FloatingElement icon={`💡`} top="10%" left="12%" size="md" />
        <FloatingElement icon={`📈`} top="14%" left="78%" size="md" />
        <FloatingElement icon={`🖌️`} top="36%" left="88%" size="md" />
        <FloatingElement icon={`🎉`} top="34%" left="4%" size="sm" />
        <FloatingElement icon={`📖`} top="70%" left="6%" size="lg" />
        <FloatingElement icon={`💻`} top="72%" left="68%" size="lg" />

        {/* Center content (now animated by parent scale) */}
        <div className="relative z-20 flex flex-col items-center justify-center text-center">
          <h1 className="text-4xl sm:text-5xl font-bold leading-tight tracking-tight relative">
            Learn{' '}
            <span className="relative inline-block">
              <span className="relative inline-block">
                {reduce ? (
                  <span
                    className="absolute left-1/2 inline-block pointer-events-none"
                    style={{ bottom: '70%', transform: 'translateX(-65%) translateY(0.1em) scaleX(-1) rotate(-22deg)', fontSize: '0.65em' }}
                  >
                    📌
                  </span>
                ) : (
                  <motion.span
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8, type: 'spring', stiffness: 200 }}
                    className="absolute left-1/2 inline-block pointer-events-none"
                    style={{ bottom: '70%', transform: 'translateX(-65%) translateY(0.1em)', fontSize: '0.65em' }}
                  >
                    <span
                      className="inline-block"
                      style={{ transform: 'scaleX(-1) rotate(-22deg)' }}
                    >
                      📌
                    </span>
                  </motion.span>
                )}
                <span className="relative z-10 inline-block">T</span>
              </span>
              oge
            </span>
            ther
          </h1>

          <p className="mt-3 text-lg font-medium text-[#89C6FF]">by incial</p>
        </div>

      </motion.div>
    </MobileSlide>
  );
};
