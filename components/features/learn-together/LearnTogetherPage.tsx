'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import LearnLandingSlide from './LearnLandingSlide';
import SkillsTogetherSlide from './SkillsTogetherSlide';
import { useCallback, useEffect, useRef } from 'react';

export default function LearnTogetherPage() {
  const [menuOpen, setMenuOpen] = useState(false);

  const [slide, setSlide] = useState(0);

  const goNext = useCallback(() => setSlide((s) => Math.min(1, s + 1)), []);
  const goPrev = useCallback(() => setSlide((s) => Math.max(0, s - 1)), []);

  // Cooldown to avoid overly-sensitive scroll triggering
  const cooldownRef = useRef(false);
  const touchStartY = useRef<number | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown') goNext();
      if (e.key === 'ArrowUp' || e.key === 'PageUp') goPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [goNext, goPrev]);

  const handleWheel = (e: React.WheelEvent) => {
    if (cooldownRef.current) return;
    const threshold = 40;
    if (e.deltaY > threshold) {
      cooldownRef.current = true;
      goNext();
      setTimeout(() => (cooldownRef.current = false), 600);
    } else if (e.deltaY < -threshold) {
      cooldownRef.current = true;
      goPrev();
      setTimeout(() => (cooldownRef.current = false), 600);
    }
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
        className="relative origin-top overflow-hidden bg-black text-white min-h-screen"
        style={{ zIndex: 30 }}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        tabIndex={0}
      >
        {slide === 0 && <LearnLandingSlide />}
        {slide === 1 && <SkillsTogetherSlide onNext={goNext} onPrev={goPrev} />}


      </motion.div>
    </div>
  );
}