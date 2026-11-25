"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { preloadCachedImage } from "@/lib/publicCache";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface ZoomRequest {
  src: string;
  href: string;
  from: Rect;
  to: Rect;
  /** Pictures the project page will show first; fetched while the picture travels, so they are ready on arrival. */
  preload?: string[];
}

const TRAVEL_SECONDS = 0.8;
/** How long the picture stays after the new page is up, so the page has time to draw behind it. */
const HOLD_MS = 250;

let current: ZoomRequest | null = null;
const listeners = new Set<() => void>();

function publish(next: ZoomRequest | null) {
  current = next;
  listeners.forEach((listener) => listener());
}

/**
 * Where the first picture sits on a project page: on the right of the fixed text panel, with a
 * small margin. This mirrors the project page's own layout, so the picture lands exactly on it.
 * Phones stack the page instead, so there the picture simply fills the top of the screen.
 */
export function projectPictureRect(): Rect {
  const width = window.innerWidth;
  const height = window.innerHeight;
  if (width < 768) return { top: 0, left: 0, width, height: Math.round(width * 0.75) };
  const panel = Math.max(width * 0.32, 352);
  return { top: 16, left: panel + 16, width: width - panel - 32, height: height - 32 };
}

/** Starts the picture's trip from its place in the gallery to its place on the project page. */
export function startCaseZoom(request: ZoomRequest) {
  for (const src of request.preload ?? []) {
    preloadCachedImage(src);
  }
  publish(request);
}

/**
 * Lives in the root layout, so it survives the change of page: the picture travels, the new page
 * opens underneath it, and only then does it let go, so there is never a blank or a jump.
 */
export default function CaseZoomOverlay() {
  const router = useRouter();
  const pathname = usePathname();
  const request = useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => current,
    () => null,
  );

  // once the project page is the one on screen, hold a moment and then let the picture go
  useEffect(() => {
    if (!request || pathname !== request.href) return;
    const timer = setTimeout(() => publish(null), HOLD_MS);
    return () => clearTimeout(timer);
  }, [request, pathname]);

  // a safety net: never leave the picture over the page if the navigation does not happen
  useEffect(() => {
    if (!request) return;
    const timer = setTimeout(() => publish(null), 8000);
    return () => clearTimeout(timer);
  }, [request]);

  return (
    <AnimatePresence>
      {request && (
        <motion.div key="case-zoom" aria-hidden className="pointer-events-none fixed inset-0 z-[100]" exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
          {/* the page goes dark behind the picture, as the project page is dark */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: TRAVEL_SECONDS * 0.8 }} className="absolute inset-0 bg-black" />
          <motion.div
            initial={{ ...request.from, borderRadius: 8 }}
            animate={{ ...request.to, borderRadius: 8 }}
            transition={{ duration: TRAVEL_SECONDS, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => router.push(request.href)}
            className="absolute overflow-hidden bg-[#111]"
          >
            {request.src && <Image src={request.src} alt="" fill priority sizes="100vw" className="object-cover" />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
