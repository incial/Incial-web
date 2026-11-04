'use client';

import { memo, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ServicesScroller from '@/components/features/services/ServicesScroller';
import { SERVICE_CATEGORIES } from '@/lib/serviceCatalog';

interface ServicesStageSlideProps {
  id?: string;
  onInView?: (id: string) => void;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * Mobile / tablet services: the same dust-logo-to-stack scroller as desktop, driven by the
 * mobile layout's own scroll container. The wrapper is a tall snap area (no overflow clipping)
 * so the stage can stay pinned while the user scrolls through it.
 */
export const ServicesStageSlide = memo(function ServicesStageSlide({
  id,
  onInView,
}: ServicesStageSlideProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLElement | null>(null);
  const [ready, setReady] = useState(false);

  // Find the layout's scroll container once mounted, before rendering the scroller.
  useIsomorphicLayoutEffect(() => {
    scrollerRef.current = wrapperRef.current?.closest<HTMLElement>('[data-mobile-scroll]') ?? null;
    setReady(true);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || !id || !onInView) return;

    let wasInView = false;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasInView) {
          wasInView = true;
          onInView(id);
        } else if (!entry.isIntersecting) {
          wasInView = false;
        }
      },
      { root: scrollerRef.current, threshold: 0 },
    );
    observer.observe(wrapper);
    return () => observer.disconnect();
  }, [id, onInView, ready]);

  return (
    <div
      ref={wrapperRef}
      className="relative w-full snap-start"
      style={{ marginTop: 'calc(-1 * var(--slide-height, 100dvh))' }}
    >
      {/* scroll target for #services: just inside the section, past the logo hand-off */}
      <div id={id} aria-hidden className="pointer-events-none absolute left-0 w-full" style={{ top: '60dvh', height: 1 }} />
      {ready && (
        <ServicesScroller
          categories={SERVICE_CATEGORIES}
          scrollContainerRef={scrollerRef}
          logoSource="[data-logo-source]"
          bridge
        />
      )}
    </div>
  );
});
