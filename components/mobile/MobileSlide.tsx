'use client';

import { useEffect, useRef, useCallback } from 'react';

interface MobileSlideProps {
  children: React.ReactNode;
  id?: string;
  onInView?: (id: string) => void;
}

export const MobileSlide = ({ children, id, onInView }: MobileSlideProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastCalledRef = useRef<string | null>(null);

  // Memoized callback to prevent unnecessary observer updates
  const handleIntersection = useCallback((id: string) => {
    if (!onInView) return;
    
    // Debounce: only call if different slide or first time
    if (lastCalledRef.current !== id) {
      lastCalledRef.current = id;
      
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      // Debounce the callback by 50ms to batch multiple observer events
      debounceTimerRef.current = setTimeout(() => {
        onInView(id);
      }, 50);
    }
  }, [onInView]);

  useEffect(() => {
    if (!onInView || !ref.current || !id) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Only fire when more than threshold is visible (not just entering)
        if (entries[0].isIntersecting && entries[0].intersectionRatio > 0.2) {
          handleIntersection(id);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(ref.current);

    return () => {
      observer.disconnect();
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
    >
      {children}
    </div>
  );
};