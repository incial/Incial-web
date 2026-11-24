'use client';

import { useCallback, useEffect, useRef, type RefObject } from 'react';
import { useMotionValue } from 'framer-motion';
import TrustZoomStage from '@/components/features/home/TrustZoomStage';

/** One phone screen of scroll, as the layout defines it. */
const SLIDE = 'var(--slide-height, 100dvh)';
/** How far the services section stays pinned (screens) after its logo has re-formed. */
export const MOBILE_SERVICES_HOLD_VH = 26;
/** Scroll length (screens) of the dissolve, the door, the reveal and the hold. */
const TAIL_SCREENS = 3;
const HOLD_SCREENS = MOBILE_SERVICES_HOLD_VH / 100;

/** The solid logo is drawn exactly as large as the phone hero logo (and so as its dust). */
const LOGO_CLASS = 'w-[66vw] max-w-[280px] h-auto';

interface MobileTrustTransitionProps {
  /** The layout's scroll container: progress is read from it, not from the window. */
  scrollerRef: RefObject<HTMLElement | null>;
}

/**
 * Phones: the same hand-over as desktop. The Trust stage is pinned over the end of the services
 * section, so the stack's grainy logo dissolves into the solid logo in place, the door opens onto
 * the Trust section, and nothing scrolls in separately afterwards. Place it right after the
 * services scroller, inside the same snap area.
 */
export default function MobileTrustTransition({ scrollerRef }: MobileTrustTransitionProps) {
  const tailRef = useRef<HTMLDivElement>(null);
  const progress = useMotionValue(0);

  // 0 when the tail's top meets the bottom of the screen, 1 after TAIL_SCREENS of scrolling
  const update = useCallback(() => {
    const tail = tailRef.current;
    const scroller = scrollerRef.current;
    if (!tail || !scroller) return;
    const screen = scroller.clientHeight;
    const travelled = scroller.getBoundingClientRect().top + screen - tail.getBoundingClientRect().top;
    progress.set(Math.min(1, Math.max(0, travelled / (screen * TAIL_SCREENS))));
  }, [scrollerRef, progress]);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    update();
    scroller.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      scroller.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [scrollerRef, update]);

  return (
    <>
      <div
        className="pointer-events-none sticky top-0 z-20 w-full"
        style={{ height: SLIDE, marginTop: `calc(-1 * ${SLIDE} * ${1 + HOLD_SCREENS})` }}
      >
        <TrustZoomStage progress={progress} withBackdrop logoClassName={LOGO_CLASS} />
      </div>
      <div
        ref={tailRef}
        id="stats"
        aria-hidden
        className="relative w-full"
        style={{ height: `calc(${SLIDE} * ${TAIL_SCREENS})` }}
      />
    </>
  );
}
