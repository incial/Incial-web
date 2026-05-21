'use client';

import { useEffect, useRef, useCallback, memo } from 'react';

interface MobileSlideProps {
  children: React.ReactNode;
  id?: string;
  onInView?: (id: string) => void;
}

export const MobileSlide = memo(function MobileSlide({ children, id, onInView }: MobileSlideProps) {
  const ref = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wasInViewRef = useRef(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized callback to prevent unnecessary observer updates
  const handleIntersection = useCallback((intersectionId: string) => {
    if (!onInView) return;

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Debounce the callback by 30ms for better performance on low-end devices.
    // This should run on every re-entry, not just the first visit.
    debounceTimerRef.current = setTimeout(() => {
      onInView(intersectionId);
    }, 30);
  }, [onInView]);

  useEffect(() => {
    if (!onInView || !ref.current || !id) return;

    // Use passive observer with reduced threshold for better performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const isVisible = entry.isIntersecting && entry.intersectionRatio > 0.1;

        // Trigger only on enter transitions so scrolling back to a slide
        // updates shared animation state correctly.
        if (isVisible && !wasInViewRef.current) {
          wasInViewRef.current = true;
          handleIntersection(id);
        } else if (!isVisible && wasInViewRef.current) {
          wasInViewRef.current = false;
        }
      },
      { 
        threshold: 0.1,
        rootMargin: '0px', // No margin for better performance
      }
    );

    observerRef.current.observe(ref.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [id, onInView, handleIntersection]);

  return (
    <div 
      ref={ref} 
      id={id} 
      className="w-full h-[calc(100dvh-110px)] shrink-0 snap-start snap-always flex items-center justify-center"
      style={{
        contain: 'layout style paint',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
        willChange: 'contents',
      }}
    >
      {children}
    </div>
  );
});

MobileSlide.displayName = 'MobileSlide';

