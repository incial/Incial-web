'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout';
import FlowSection from './FlowSection';
import { useSmoothScroll } from './useSmoothScroll';
import LearnLandingSlide from './LearnLandingSlide';
import SkillsTogetherSlide from './SkillsTogetherSlide';
import Itstatedwith from './itstartedwith';
import Whatwexlpore from './Whatwexlpore';
import Explore1 from './Explore1';
import Notjustech from './Notjustech';
import Itsaboutbuild from './Itsaboutbuild';
import Wedont from './Wedont';
import Ourapproach from './OurApproach';
import ReadyToStartBuilding from './ReadyToStartBuilding';

interface Nav {
  onNext: () => void;
  onPrev: () => void;
}

interface FlowStep {
  minHeight: string;
  Slide: ComponentType<Nav>;
}

/** The flow, top to bottom. Explore is a long scrolling section; the rest are one screen each. */
const STEPS: FlowStep[] = [
  { minHeight: '100vh', Slide: LearnLandingSlide },
  { minHeight: '100vh', Slide: SkillsTogetherSlide },
  { minHeight: '100vh', Slide: Itstatedwith },
  { minHeight: '100vh', Slide: Whatwexlpore },
  { minHeight: '260vh', Slide: Explore1 },
  { minHeight: '100vh', Slide: Notjustech },
  { minHeight: '100vh', Slide: Itsaboutbuild },
  { minHeight: '100vh', Slide: Wedont },
  { minHeight: '100vh', Slide: Ourapproach },
  { minHeight: '100vh', Slide: ReadyToStartBuilding },
];

const LAST = STEPS.length - 1;

export default function LearnTogetherPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const lenisRef = useSmoothScroll();
  const sectionsRef = useRef<Array<HTMLElement | null>>([]);

  const registerSection = useCallback((index: number, element: HTMLElement | null) => {
    sectionsRef.current[index] = element;
  }, []);

  const scrollToY = useCallback(
    (y: number) => {
      const lenis = lenisRef.current;
      if (lenis) lenis.scrollTo(y, { duration: 1.4 });
      else window.scrollTo({ top: y, behavior: 'smooth' });
    },
    [lenisRef],
  );

  /** Moves to a section; going back into a long one lands at its end so the flow reads on. */
  const goTo = useCallback(
    (index: number, direction: 1 | -1) => {
      const target = sectionsRef.current[Math.max(0, Math.min(LAST, index))];
      if (!target) return;
      const top = target.getBoundingClientRect().top + window.scrollY;
      const isTall = target.offsetHeight > window.innerHeight * 1.5;
      scrollToY(direction < 0 && isTall ? top + target.offsetHeight - window.innerHeight : top);
    },
    [scrollToY],
  );

  const currentIndex = useCallback(() => {
    const middle = window.innerHeight / 2;
    return sectionsRef.current.findIndex((el) => {
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return rect.top <= middle && rect.bottom > middle;
    });
  }, []);

  // PageUp / PageDown (and arrows on one-screen slides) step through the flow
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const down = event.key === 'PageDown' || event.key === 'ArrowDown';
      const up = event.key === 'PageUp' || event.key === 'ArrowUp';
      if (!down && !up) return;

      const index = currentIndex();
      if (index < 0) return;
      const isArrow = event.key.startsWith('Arrow');
      const isTall = (sectionsRef.current[index]?.offsetHeight ?? 0) > window.innerHeight * 1.5;
      if (isArrow && isTall) return; // let long sections scroll naturally

      event.preventDefault();
      goTo(index + (down ? 1 : -1), down ? 1 : -1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [currentIndex, goTo]);

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
        className="relative origin-top overflow-x-clip bg-black text-white min-h-screen"
        style={{ zIndex: 30 }}
      >
        {STEPS.map((step, index) => (
          <FlowSection
            key={index}
            index={index}
            minHeight={step.minHeight}
            onElement={registerSection}
          >
            <step.Slide
              onNext={() => goTo(index + 1, 1)}
              onPrev={() => goTo(index - 1, -1)}
            />
          </FlowSection>
        ))}
      </motion.div>
    </div>
  );
}
