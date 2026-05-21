'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import LogoScreen from '@/components/features/home/LogoScreen';

interface MobilePreloaderProps {
  onComplete: () => void;
}

export const MobilePreloader = ({ onComplete }: MobilePreloaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const [useReducedMotion, setUseReducedMotion] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Detect reduced motion preference
  useEffect(() => {
    if (typeof window === 'undefined' || !('matchMedia' in window)) return;

    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setUseReducedMotion(media.matches);

    syncPreference();
    media.addEventListener('change', syncPreference);
    
    return () => media.removeEventListener('change', syncPreference);
  }, []);

  // Optimized completion handler with proper cleanup
  const handleComplete = useCallback(() => {
    setIsVisible(false);
    onComplete();
  }, [onComplete]);

  // Preloader timeout with device-aware duration
  useEffect(() => {
    // Reduced duration for better perceived performance on low-end devices
    const duration = useReducedMotion ? 800 : 2800;
    
    timerRef.current = setTimeout(() => {
      handleComplete();
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [handleComplete, useReducedMotion]);

  if (!isVisible) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black [contain:layout_paint_style]"
      style={{ 
        transform: 'translateZ(0)', 
        backfaceVisibility: 'hidden',
        willChange: 'contents',
      }}
    >
      <div 
        className="flex h-full w-full items-center justify-center px-6"
        style={{ contain: 'layout style paint' }}
      >
        <div 
          className="relative aspect-square w-[min(78vw,260px)]"
          style={{ 
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            willChange: 'transform',
          }}
        >
          <LogoScreen 
            skipAnimation={useReducedMotion} 
            sizeMode="mobile" 
          />
        </div>
      </div>
    </div>
  );
};

