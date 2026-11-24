'use client';

import { useState, useCallback, useEffect, useMemo, useRef, memo, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
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

/** The logo takes about this long to draw and fade in; the buttons wait for it. */
const CONTROLS_AFTER_LOGO_MS = 2600;
/** The buttons slide in from below the screen, and slide back down while the logo turns to dust. */
const CONTROLS_SLIDE_PX = 280;
/** How far the buttons drift down while they fade out on scroll. */
const CONTROLS_DRIFT_PX = 150;
/** The phone logo sits this far above the slide's centre (see LogoScreen's mobile layout). */
const LOGO_LIFT_PX = 38;
/** Space between the logo's artwork and the buttons. */
const GAP_BELOW_LOGO_PX = 24;

const navTargets: Record<string, string> = {
  about: '/about',
  works: '/pdf/Brochure.pdf',
  products: '/products',
};

// Memoized CTA Button component
// The first button is solid white with black text; the second is outlined: a white stroke and white text.
const BUTTON_STYLES = {
  solid: 'border-white bg-white text-black hover:bg-white/90 active:bg-white/80',
  outline: 'border-white bg-transparent text-white hover:bg-white/10 active:bg-white/15',
} as const;

const CTAButton = memo(
  ({
    label,
    action,
    variant,
    icon,
    onClick,
  }: {
    label: string;
    action: string;
    variant: keyof typeof BUTTON_STYLES;
    icon: ReactNode;
    onClick: (action: string) => void;
  }) => {
    return (
      <motion.button
        onClick={() => onClick(action)}
        whileTap={{ scale: 0.98 }}
        className={`flex-none min-w-[11rem] rounded-full border flex items-center justify-center gap-2 px-5 py-3.5 text-[12px] font-semibold whitespace-nowrap transition-colors text-center leading-tight ${BUTTON_STYLES[variant]}`}
        style={{ transform: 'translateZ(0)' }}
      >
        {label}
        {icon}
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
  // The buttons wait for the logo: they only appear once the intro has finished and the logo is in.
  const [showControls, setShowControls] = useState(false);

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
  const controlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleSequenceComplete = useCallback(() => {
    onIntroComplete?.();
    if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    controlsTimerRef.current = setTimeout(() => setShowControls(true), CONTROLS_AFTER_LOGO_MS);
  }, [onIntroComplete]);

  useEffect(
    () => () => {
      if (controlsTimerRef.current) clearTimeout(controlsTimerRef.current);
    },
    [],
  );

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
        <div
          className="pointer-events-none absolute inset-0 z-20"
          style={{
            // as you start scrolling the buttons drift down toward the bottom while they fade out
            // (the logo stays whole until they are gone)
            opacity: 'calc(1 - var(--landing-shift, 0))',
            translate: `0 calc(var(--landing-shift, 0) * ${CONTROLS_DRIFT_PX}px)`,
          }}
        >
        <AnimatePresence>
          {showControls && (
            <motion.div
              initial={{ y: CONTROLS_SLIDE_PX }}
              animate={{ y: 0 }}
              exit={{ y: CONTROLS_SLIDE_PX }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pointer-events-auto absolute left-1/2 -translate-x-1/2 w-[90%] max-w-[320px] flex z-20"
              style={{
                // just under the circular path: the logo is centred (and nudged up) in the slide, and the
                // path ends about half the logo box below its centre
                top: `calc(50% - ${LOGO_LIFT_PX}px + min(66vw, 280px) * 0.572 + ${GAP_BELOW_LOGO_PX}px)`,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
              }}
            >
              {/* the row takes the free width (flex: 1); each button keeps its own size (flex: 0) */}
              <div className="flex flex-1 flex-col items-center justify-center gap-3">
                <CTAButton
                  label="Our Products"
                  action="products"
                  variant="solid"
                  icon={<ArrowRight size={15} strokeWidth={2.4} aria-hidden />}
                  onClick={handleCTA}
                />
                <CTAButton
                  label="Our Works"
                  action="works"
                  variant="outline"
                  icon={<ArrowRight size={15} strokeWidth={2.4} aria-hidden />}
                  onClick={handleCTA}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        </div>
      </div>
    </MobileSlide>
  );
});

