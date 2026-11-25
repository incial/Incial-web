"use client";

import { useEffect, useRef } from "react";
import {
  cancelFrame,
  frame,
  useMotionValue,
  useMotionValueEvent,
  type FrameData,
  type MotionValue,
} from "framer-motion";

/** Share of the remaining gap closed per 60fps frame: small scrolls still move visibly and settle quickly. */
const FOLLOW_PER_FRAME = 0.16;
/**
 * Fastest the animation may travel, in viewport heights of scroll per second. A quick flick
 * plays every frame of the pinned animation at this pace instead of skipping past elements.
 */
const MAX_VH_PER_SECOND = 260;
/** A single scroll change bigger than this (a link or a programmatic jump) lands at once. */
const JUMP_VH = 150;
const SETTLED = 0.0004;
const FRAME_MS = 1000 / 60;

/**
 * Follows a 0..1 scroll progress smoothly with a speed limit. Slow scrolling moves the animation
 * straight away; fast scrolling is capped so every state is still drawn on the way.
 * It steps in framer-motion's own frame loop, so what it drives is painted in the same frame.
 *
 * @param source  raw progress read from the scroll position
 * @param spanVh  scroll length (viewport heights) that `source` covers from 0 to 1
 */
export function useAdaptiveProgress(source: MotionValue<number>, spanVh: number): MotionValue<number> {
  const output = useMotionValue(source.get());
  const runningRef = useRef(false);
  const lastSourceRef = useRef(source.get());
  const spanRef = useRef(Math.max(1, spanVh));
  const tickRef = useRef<(data: FrameData) => void>(() => {});

  useEffect(() => {
    spanRef.current = Math.max(1, spanVh);
  }, [spanVh]);

  useEffect(() => {
    const tick = ({ delta }: FrameData) => {
      const dt = Math.min(64, delta || FRAME_MS);
      const target = source.get();
      const current = output.get();
      const gap = target - current;

      if (Math.abs(gap) < SETTLED) {
        output.set(target);
        cancelFrame(tick);
        runningRef.current = false;
        return;
      }

      const eased = gap * (1 - Math.pow(1 - FOLLOW_PER_FRAME, dt / FRAME_MS));
      const maxStep = (MAX_VH_PER_SECOND / spanRef.current) * (dt / 1000);
      output.set(current + Math.sign(eased) * Math.min(Math.abs(eased), maxStep));
    };
    tickRef.current = tick;
    return () => {
      cancelFrame(tick);
      runningRef.current = false;
    };
  }, [source, output]);

  useMotionValueEvent(source, "change", (value) => {
    const jump = Math.abs(value - lastSourceRef.current) * spanRef.current;
    lastSourceRef.current = value;
    if (jump > JUMP_VH) {
      output.jump(value);
      return;
    }
    if (runningRef.current) return;
    runningRef.current = true;
    frame.update(tickRef.current, true);
  });

  return output;
}
