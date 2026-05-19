'use client';

import { ReactNode, useEffect, useRef, useState, useMemo } from 'react';

interface MobileArtboardProps {
  children: ReactNode;
  baseWidth?: number;
  baseHeight?: number;
}

interface ArtboardLayout {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export const MobileArtboard = ({
  children,
  baseWidth = 390,
  baseHeight = 780,
}: MobileArtboardProps) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState<ArtboardLayout>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });

  // Throttle layout updates to prevent thrashing
  const updateScheduledRef = useRef(false);

  useEffect(() => {
    const updateLayout = () => {
      const host = hostRef.current;
      if (!host) return;

      const rect = host.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const scale = Math.min(rect.width / baseWidth, rect.height / baseHeight);
      const offsetX = (rect.width - baseWidth * scale) / 2;
      const offsetY = (rect.height - baseHeight * scale) / 2;

      setLayout({ scale, offsetX, offsetY });
      updateScheduledRef.current = false;
    };

    const scheduleUpdate = () => {
      if (!updateScheduledRef.current) {
        updateScheduledRef.current = true;
        requestAnimationFrame(() => {
          updateLayout();
        });
      }
    };

    updateLayout();

    // Use ResizeObserver but throttle updates with requestAnimationFrame
    const observer = new ResizeObserver(() => {
      scheduleUpdate();
    });

    if (hostRef.current) {
      observer.observe(hostRef.current);
    }

    return () => observer.disconnect();
  }, [baseWidth, baseHeight]);

  // Memoize the transform to prevent object recreation
  const transformStyle = useMemo(() => ({
    transform: `translate(${layout.offsetX}px, ${layout.offsetY}px) scale(${layout.scale})`,
    transformOrigin: 'top left',
    willChange: 'auto' as const,
  }), [layout.offsetX, layout.offsetY, layout.scale]);

  return (
    <div 
      ref={hostRef} 
      className="relative h-full w-full overflow-hidden"
      style={{ contain: 'layout style paint' }}
    >
      <div
        className="absolute left-0 top-0"
        style={{
          width: `${baseWidth}px`,
          height: `${baseHeight}px`,
          ...transformStyle,
        }}
      >
        {children}
      </div>
    </div>
  );
};