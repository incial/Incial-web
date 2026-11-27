"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import ShaderBackground from "@/components/ui/ShaderBackground";
import { rotatingWords } from "@/lib/constants";
import BackgroundCircle from "./BackgroundCircle";
import RotatingText from "./RotatingText";

const WORD_INTERVAL_MS = 1400;
/** "Beyond." holds a little longer, so the globe finishes rising and is seen. */
const LAST_WORD_HOLD_MS = 2200;
/** After a gesture jumps to the last word, how long before another gesture may end the intro. */
const LAST_WORD_MIN_MS = 900;
/** How long the black takes to sweep away. */
const EXIT_S = 1.25;
/** How far the middle of the sweeping edge trails its sides, as a share of the screen height. */
const BULGE = 0.22;

/**
 * The black panel's outline at sweep progress `p` (0 covers the screen, 1 is gone): its bottom edge
 * rises from the bottom of the screen past the top, and bows downward in the middle as it goes,
 * like a liquid pulled upward, so the page shows from the sides first.
 */
function sweepPath(p: number, width: number, height: number): string {
  const bulge = height * BULGE * Math.sin(Math.PI * Math.min(1, p * 1.15));
  const sides = (height + height * BULGE) * (1 - p) - height * BULGE;
  // a quadratic curve peaks halfway to its control point, so the control sits twice as deep
  return `path("M 0 0 L ${width} 0 L ${width} ${sides} Q ${width / 2} ${sides + bulge * 2} 0 ${sides} Z")`;
}

interface HomeIntroProps {
  /** Called as the black starts to sweep away (the page below can begin its own entrance). */
  onLeave: () => void;
  /** Called once the black is gone. */
  onDone: () => void;
  /** False while the greetings still play: the words wait. */
  start: boolean;
}

/**
 * The opening, on black: "We build Brand / Business / Beyond." over the near-black shader, with the
 * globe rising behind the words. Then the black sweeps up and away with a soft curved edge (its
 * middle trailing, like a liquid), revealing the page beneath. A scroll, swipe or key press jumps to
 * the last word with the globe; another, once the globe is up, starts the sweep. While it plays the
 * page cannot scroll. It covers the page from the first frame.
 */
export default function HomeIntro({ onLeave, onDone, start }: HomeIntroProps) {
  const [wordIndex, setWordIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const lastWordAtRef = useRef(0);
  const lastIndex = rotatingWords.length - 1;
  const isLast = wordIndex >= lastIndex;

  const progress = useMotionValue(0);
  const clipPath = useTransform(progress, (p) => sweepPath(p, window.innerWidth, window.innerHeight));

  const leave = useCallback(() => setLeaving(true), []);

  // remember when the last word arrived, so a gesture cannot end the intro before the globe is up
  useEffect(() => {
    if (isLast) lastWordAtRef.current = performance.now();
  }, [isLast]);

  // the words advance on their own (once the greetings are over), then the sweep begins
  useEffect(() => {
    if (leaving || !start) return;
    const timer = window.setTimeout(() => (isLast ? leave() : setWordIndex((index) => index + 1)), isLast ? LAST_WORD_HOLD_MS : WORD_INTERVAL_MS);
    return () => window.clearTimeout(timer);
  }, [wordIndex, isLast, leaving, leave, start]);

  // a gesture jumps to the last word; another, once the globe has risen, starts the sweep
  useEffect(() => {
    if (!start || leaving) return;
    const onGesture = () => {
      if (!isLast) setWordIndex(lastIndex);
      else if (performance.now() - lastWordAtRef.current > LAST_WORD_MIN_MS) leave();
    };
    window.addEventListener("wheel", onGesture, { passive: true });
    window.addEventListener("touchstart", onGesture, { passive: true });
    window.addEventListener("keydown", onGesture);
    return () => {
      window.removeEventListener("wheel", onGesture);
      window.removeEventListener("touchstart", onGesture);
      window.removeEventListener("keydown", onGesture);
    };
  }, [start, leaving, isLast, lastIndex, leave]);

  // the page is held still until the intro is gone
  useEffect(() => {
    const root = document.documentElement;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = "";
    };
  }, []);

  // the sweep
  useEffect(() => {
    if (!leaving) return;
    onLeave();
    const controls = animate(progress, 1, {
      duration: EXIT_S,
      ease: [0.65, 0, 0.35, 1],
      onComplete: () => {
        document.documentElement.style.overflow = "";
        onDone();
      },
    });
    return () => controls.stop();
  }, [leaving, progress, onLeave, onDone]);

  return (
    <motion.div aria-hidden className="fixed inset-0 z-[60] overflow-hidden bg-black text-white" style={{ clipPath, willChange: "clip-path" }}>
      <ShaderBackground variant="dark" className="absolute inset-0 h-full w-full" />
      <motion.div
        className="absolute inset-0 z-20 flex items-center justify-center"
        animate={{ opacity: leaving ? 0 : 1, y: leaving ? -60 : 0 }}
        transition={{ duration: 0.6, ease: [0.65, 0, 0.35, 1] }}
      >
        <RotatingText wordIndex={wordIndex} words={rotatingWords} />
      </motion.div>
      <motion.div className="absolute inset-0" animate={{ y: leaving ? "-18%" : "0%" }} transition={{ duration: EXIT_S, ease: [0.65, 0, 0.35, 1] }}>
        <BackgroundCircle wordIndex={wordIndex} showLogo={false} totalWords={rotatingWords.length} />
      </motion.div>
    </motion.div>
  );
}
