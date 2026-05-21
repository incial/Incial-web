'use client';

import { memo, useState, ReactNode, useEffect, useRef } from 'react';
import { MobileMenu } from './MobileMenu';

interface MobileLayoutProps {
  children: ReactNode;
  backgroundLayer?: ReactNode;
  scrollLocked?: boolean;
}

const MobileHeader = memo(function MobileHeader({
  menuOpen,
  onToggleMenu,
}: {
  menuOpen: boolean;
  onToggleMenu: () => void;
}) {
  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 flex h-[110px] items-center justify-between bg-black/95 px-6 pt-[45px] pb-2 backdrop-blur-sm md:hidden ${
        menuOpen ? 'hidden' : ''
      }`}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        transform: 'translate3d(0, 0, 0)',
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        contain: 'layout paint style',
        WebkitBackdropFilter: 'blur(4px)',
        backdropFilter: 'blur(4px)',
      }}
    >
      <div className="text-[15.5px] leading-none tracking-[-0.02em] text-white">
        <span className="font-normal">We Are </span>
        <span className="font-extrabold">incial.</span>
      </div>
      <button
        onClick={onToggleMenu}
        className="flex h-9 w-9 items-center justify-center rounded-full border border-white/90 text-white focus:outline-none"
        aria-label="Toggle menu"
      >
        <span className="relative block h-3.5 w-3.5">
          <span className="absolute left-0 top-0.5 h-[1.5px] w-3.5 bg-white/90" />
          <span className="absolute left-0 top-[6px] h-[1.5px] w-3.5 bg-white/90" />
          <span className="absolute left-0 top-[11px] h-[1.5px] w-3.5 bg-white/90" />
        </span>
      </button>
    </header>
  );
});

MobileHeader.displayName = 'MobileHeader';

export const MobileLayout = ({ children, backgroundLayer, scrollLocked = false }: MobileLayoutProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Add scroll optimization styles at component level
  useEffect(() => {
    // Disable the default scroll snap behavior if it's causing frame drops
    // on low-end devices. Browsers handle snap calculations on every scroll frame.
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      // Optional: add scroll behavior optimization
      scrollContainer.addEventListener('scroll', () => {
        // This is a passive listener - no preventDefault
      }, { passive: true });
    }
  }, []);

  // Throttle scroll events for low-end devices
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          ticking = false;
        });
        ticking = true;
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => scrollContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer || !scrollLocked) return;

    const preventScroll = (event: Event) => {
      event.preventDefault();
    };

    const pinToTop = () => {
      if (scrollContainer.scrollTop !== 0) {
        scrollContainer.scrollTop = 0;
      }
    };

    // Ensure we're always at the landing slide while intro animation is running.
    pinToTop();

    scrollContainer.addEventListener('wheel', preventScroll, { passive: false });
    scrollContainer.addEventListener('touchmove', preventScroll, { passive: false });
    scrollContainer.addEventListener('scroll', pinToTop, { passive: true });

    return () => {
      scrollContainer.removeEventListener('wheel', preventScroll);
      scrollContainer.removeEventListener('touchmove', preventScroll);
      scrollContainer.removeEventListener('scroll', pinToTop);
    };
  }, [scrollLocked]);

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* Fixed Header */}
      <MobileHeader menuOpen={menuOpen} onToggleMenu={() => setMenuOpen(!menuOpen)} />

      {/* Menu */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Background Layer - Optimized for GPU rendering */}
      {backgroundLayer && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{ 
            contain: 'layout style paint',
            transform: 'translateZ(0)',
          }}
        >
          {backgroundLayer}
        </div>
      )}

      {/* Scroll Container - Optimized for smooth scrolling */}
      <div 
        ref={scrollContainerRef}
        className="relative z-10 mt-[110px] h-[calc(100dvh-110px)] w-full overflow-y-scroll snap-y snap-mandatory"
        style={{
          overflowY: scrollLocked ? 'hidden' : 'scroll',
          touchAction: scrollLocked ? 'none' : 'pan-y',
          WebkitOverflowScrolling: 'touch',
          overscrollBehavior: 'contain',
          scrollBehavior: scrollLocked ? 'auto' : 'smooth',
        }}
      >
        {/* Remove scrollbar styling */}
        <style>{`
          .snap-y::-webkit-scrollbar {
            display: none;
          }
          .snap-y {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        {children}
      </div>
    </div>
  );
};