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
  const lastCalledRef = useRef<string | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Memoized callback to prevent unnecessary observer updates
  const handleIntersection = useCallback((intersectionId: string) => {
    if (!onInView) return;
    
    // Debounce: only call if different slide or first time
    if (lastCalledRef.current !== intersectionId) {
      lastCalledRef.current = intersectionId;
      
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Debounce the callback by 30ms for better performance on low-end devices
      debounceTimerRef.current = setTimeout(() => {
        onInView(intersectionId);
      }, 30);
    }
  }, [onInView]);

  useEffect(() => {
    if (!onInView || !ref.current || !id) return;

    // Use passive observer with reduced threshold for better performance
    observerRef.current = new IntersectionObserver(
      (entries) => {
        // Only fire when visible (lower threshold for faster detection)
        if (entries[0].isIntersecting && entries[0].intersectionRatio > 0.1) {
          handleIntersection(id);
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

