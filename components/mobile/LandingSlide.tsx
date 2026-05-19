'use client';

import { useState, useCallback } from 'react';
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

export function LandingSlide({ onNavigate, playLogoAnimation = false, warmupOnly = false, id, onInView }: LandingSlideProps) {
  const router = useRouter();
  const [showControls, setShowControls] = useState(!playLogoAnimation);

  const handleCTA = (action: string) => {
    if (onNavigate) {
      onNavigate(action);
      return;
    }

    const target = navTargets[action];
    if (target) {
      router.push(target);
    }
  };

  const handleSequenceComplete = useCallback(() => {
    setShowControls(true);
  }, []);

  return (
    <MobileSlide id={id} onInView={onInView}>
      <div className="w-full h-full flex flex-col items-center justify-between px-6 pb-8 pt-8">
        {/* Post-preloader intro animation */}
        <div className="flex flex-1 items-center justify-center w-full">
          <div className="relative h-full w-full">
            <LandingIntroSequence
              key={`${playLogoAnimation ? 'active' : 'idle'}-${warmupOnly ? 'warmup' : 'live'}`}
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
            >
              {/* Divider */}
              <div className="h-[1px] w-full bg-white/40" />

              {/* CTA Buttons */}
              <div className="flex w-full items-center justify-between pt-6">
                <button
                  onClick={() => handleCTA('about')}
                  className="rounded-full border border-white/80 px-[24px] py-[11px] text-[12px] font-medium text-white transition-colors hover:bg-white hover:text-black"
                >
                  About Us
                </button>
                <button
                  onClick={() => handleCTA('works')}
                  className="rounded-full border border-white/80 px-[24px] py-[11px] text-[12px] font-medium text-white transition-colors hover:bg-white hover:text-black"
                >
                  Our Works
                </button>
                <button
                  onClick={() => handleCTA('products')}
                  className="rounded-full border border-white/80 px-[24px] py-[11px] text-[12px] font-medium text-white transition-colors hover:bg-white hover:text-black"
                >
                  Our Products
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </MobileSlide>
  );
}
