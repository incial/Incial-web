'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import LearnLandingSlide from './LearnLandingSlide';
import SkillsTogetherSlide from './SkillsTogetherSlide';
import Itstatedwith from "./itstartedwith";
import { useCallback, useEffect, useRef } from 'react';
import Whatwexlpore from './Whatwexlpore';

export default function LearnTogetherPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [slide, setSlide] = useState(0);

  const goNext = useCallback(() => setSlide((s) => Math.min(3, s + 1)), []);
  const goPrev = useCallback(() => setSlide((s) => Math.max(0, s - 1)), []);

  // Cooldown to avoid overly-sensitive scroll triggering
  const cooldownRef = useRef(false);
  const touchStartY = useRef<number | null>(null);
  const wheelDeltaRef = useRef(0);
  const wheelRafRef = useRef<number | null>(null);
  const wheelIdleTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goNext();
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const normalizedDelta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    wheelDeltaRef.current += normalizedDelta;

    if (wheelIdleTimeoutRef.current !== null) {
      window.clearTimeout(wheelIdleTimeoutRef.current);
    }
    wheelIdleTimeoutRef.current = window.setTimeout(() => {
      wheelDeltaRef.current = 0;
      wheelIdleTimeoutRef.current = null;
    }, 220);

    if (cooldownRef.current || wheelRafRef.current !== null) return;

    wheelRafRef.current = window.requestAnimationFrame(() => {
      wheelRafRef.current = null;
      if (cooldownRef.current) return;

      const delta = wheelDeltaRef.current;
      const isTouchpad = Math.abs(delta) < 80;
      const threshold = isTouchpad ? 120 : 60;
      const cooldownMs = isTouchpad ? 900 : 700;

      if (delta > threshold) {
        cooldownRef.current = true;
        wheelDeltaRef.current = 0;
        goNext();
        setTimeout(() => (cooldownRef.current = false), cooldownMs);
      } else if (delta < -threshold) {
        cooldownRef.current = true;
        wheelDeltaRef.current = 0;
        goPrev();
        setTimeout(() => (cooldownRef.current = false), cooldownMs);
      } else {
        wheelDeltaRef.current *= 0.85;
      }
    });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (cooldownRef.current) return;
    const start = touchStartY.current;
    const end = e.changedTouches[0]?.clientY ?? null;
    if (start == null || end == null) return;
    const delta = start - end;
    const threshold = 40;
    if (delta > threshold) {
      cooldownRef.current = true;
      goNext();
      setTimeout(() => (cooldownRef.current = false), 600);
    } else if (delta < -threshold) {
      cooldownRef.current = true;
      goPrev();
      setTimeout(() => (cooldownRef.current = false), 600);
    }
    touchStartY.current = null;
  };

  return (
    <div className="relative bg-white min-h-screen">
      <Header menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} />

      <motion.div
        animate={{
          y: menuOpen ? 100 : 0,
          scale: menuOpen ? 0.95 : 1,
          borderTopLeftRadius: menuOpen ? 24 : 0,
          borderTopRightRadius: menuOpen ? 24 : 0,
        }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative origin-top overflow-hidden bg-black text-white min-h-screen overscroll-none"
        style={{ zIndex: 30 }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
      >
        {slide === 0 && <LearnLandingSlide />}
        {slide === 1 && <SkillsTogetherSlide onNext={goNext} onPrev={goPrev} />}
        {slide === 2 && <Itstatedwith onNext={goNext} onPrev={goPrev} />}
        {slide === 3 && <Whatwexlpore onNext={goNext} onPrev={goPrev} />}

        {/* Placeholder for third slide */}

        {/* Simple keyboard / click controls to advance slides for testing */}
        <div className="absolute bottom-6 left-6 z-40 flex gap-3">
          <button
            onClick={goPrev}
            className="rounded border border-white/20 px-3 py-1 text-sm"
          >
            Prev
          </button>
          <button
            onClick={goNext}
            className="rounded bg-white/10 px-3 py-1 text-sm"
          >
            Next
          </button>
        </div>
      </motion.div>
    </div>
  );
}