"use client";

import { useEffect, useState, type RefObject } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// d3-geo is only needed for the globe, and the globe is canvas-only, so skip SSR.
const RotatingEarth = dynamic(() => import("./RotatingEarth"), { ssr: false });

interface BackgroundCircleProps {
  circleRef?: RefObject<HTMLDivElement | null>;
  wordIndex: number;
  showLogo: boolean;
  totalWords: number;
}

/** Globe diameter as a share of the screen's shorter side, with limits (px). */
const SIZE_VMIN = 0.56;
const MIN_SIZE_PX = 192;
const MAX_SIZE_PX = 576;
/** At the start only this much of the globe's top peeks above the bottom edge (share of height). */
const PEEK = 0.05;
/** Where the globe's centre ends up behind the text (share of height from the top). */
const REST_CENTER = 0.54;

function readViewport() {
  return { width: window.innerWidth, height: window.innerHeight };
}

/**
 * The globe rises from the bottom edge to sit behind the intro text. Its position is worked out
 * from the screen height (not from its own size), so it is always in view at the right place
 * whatever size it is drawn at.
 */
export default function BackgroundCircle({
  circleRef,
  wordIndex,
  showLogo,
  totalWords,
}: BackgroundCircleProps) {
  const [viewport, setViewport] = useState(readViewport);

  useEffect(() => {
    const onResize = () => setViewport(readViewport());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const { width, height } = viewport;
  const size = Math.min(MAX_SIZE_PX, Math.max(MIN_SIZE_PX, Math.min(width, height) * SIZE_VMIN));

  // the last word is the end point, so the globe is fully up before the logo takes over
  const progress = Math.min(wordIndex / Math.max(totalWords - 1, 1), 1);
  const startTop = height * (1 - PEEK);
  const restTop = height * REST_CENTER - size / 2;
  const top = showLogo ? height + 24 : startTop + (restTop - startTop) * progress;

  return (
    <motion.div
      ref={circleRef}
      className="pointer-events-none absolute left-1/2 top-0 z-10"
      initial={{ y: startTop, opacity: 1 }}
      animate={{ y: top, opacity: showLogo ? 0 : 1 }}
      transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      style={{ width: size, height: size, marginLeft: -size / 2, willChange: "transform, opacity" }}
    >
      <RotatingEarth className="h-full w-full" width={1000} height={1000} />
    </motion.div>
  );
}
