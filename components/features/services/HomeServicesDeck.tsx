"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { isGlobalScrollLocked, lockGlobalScroll } from "@/lib/scrollLock";
import { SERVICE_CATEGORIES } from "@/lib/serviceCatalog";
import ServicesScroller from "./ServicesScroller";

interface HomeServicesDeckProps {
  startAtEnd?: boolean;
  onComplete?: () => void;
  onBack?: () => void;
}

const MOUNT_GRACE_MS = 900;
const EDGE_THRESHOLD = 70;
const TOUCH_THRESHOLD = 60;
const EDGE_EPSILON = 2;

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

/**
 * Homepage (#services) version: the pinned scroller lives in its own scroll
 * container, and pushing past either end (wheel or touch) hands control back to
 * the homepage section deck.
 */
export default function HomeServicesDeck({
  startAtEnd = false,
  onComplete,
  onBack,
}: HomeServicesDeckProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Arrive at the end before the first paint when coming back from the next section.
  useIsomorphicLayoutEffect(() => {
    const el = scrollRef.current;
    if (el && startAtEnd) el.scrollTop = el.scrollHeight;
  }, [startAtEnd]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const mountedAt = Date.now();
    const isReady = () => Date.now() - mountedAt >= MOUNT_GRACE_MS && !isGlobalScrollLocked();
    const isAtTop = () => el.scrollTop <= EDGE_EPSILON;
    const isAtBottom = () => el.scrollTop + el.clientHeight >= el.scrollHeight - EDGE_EPSILON;

    let accumulator = 0;
    let lastWheel = 0;

    const handleWheel = (e: WheelEvent) => {
      const now = Date.now();
      if (now - lastWheel > 200) accumulator = 0;
      lastWheel = now;

      const pushingPastEdge =
        (e.deltaY < 0 && isAtTop()) || (e.deltaY > 0 && isAtBottom());
      if (!pushingPastEdge) {
        accumulator = 0;
        return;
      }

      e.preventDefault();
      if (!isReady()) {
        accumulator = 0;
        return;
      }

      accumulator += e.deltaY;
      if (accumulator > EDGE_THRESHOLD && onComplete) {
        accumulator = 0;
        lockGlobalScroll(1000);
        onComplete();
      } else if (accumulator < -EDGE_THRESHOLD && onBack) {
        accumulator = 0;
        lockGlobalScroll(900);
        onBack();
      }
    };

    // Touch: only a swipe that began at an edge can leave the section, so scrolling up to
    // the top mid-gesture never exits by accident.
    let touchStartY = 0;
    let startedAtTop = false;
    let startedAtBottom = false;
    let touchHandled = false;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0].clientY;
      startedAtTop = isAtTop();
      startedAtBottom = isAtBottom();
      touchHandled = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (touchHandled || !isReady()) return;
      const dy = touchStartY - e.touches[0].clientY; // > 0: finger moving up, reading further
      if (dy > TOUCH_THRESHOLD && startedAtBottom && isAtBottom() && onComplete) {
        touchHandled = true;
        lockGlobalScroll(1000);
        onComplete();
      } else if (dy < -TOUCH_THRESHOLD && startedAtTop && isAtTop() && onBack) {
        touchHandled = true;
        lockGlobalScroll(900);
        onBack();
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    el.addEventListener("touchstart", handleTouchStart, { passive: true });
    el.addEventListener("touchmove", handleTouchMove, { passive: true });
    return () => {
      window.removeEventListener("wheel", handleWheel);
      el.removeEventListener("touchstart", handleTouchStart);
      el.removeEventListener("touchmove", handleTouchMove);
    };
  }, [onBack, onComplete]);

  return (
    <div
      ref={scrollRef}
      data-lenis-prevent
      className="relative h-full w-full overflow-y-auto overscroll-contain bg-black [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <ServicesScroller
        categories={SERVICE_CATEGORIES}
        scrollContainerRef={scrollRef}
        logoSource="[data-logo-source]"
        startAtEnd={startAtEnd}
      />
    </div>
  );
}
