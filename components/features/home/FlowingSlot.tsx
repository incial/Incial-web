"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "framer-motion";

interface FlowingSlotProps {
  /** The alternatives that take turns in this slot (they must be single-line text). */
  items: ReactNode[];
  activeIndex: number;
  className?: string;
}

const OUT_SECONDS = 0.22;
const IN_SECONDS = 0.42;
const WIDTH_SECONDS = 0.6;
const EASE = [0.22, 1, 0.36, 1] as const;

/**
 * One slot in a centred line of text. Its width glides to the width of whichever item is active,
 * so the whole line re-centres smoothly instead of jumping, and the outgoing item clears out
 * before the incoming one fades in: no two texts ever overlap or mix.
 */
export default function FlowingSlot({ items, activeIndex, className = "" }: FlowingSlotProps) {
  const measureRef = useRef<HTMLSpanElement>(null);
  const [widths, setWidths] = useState<number[]>([]);

  // each item is measured in a hidden copy, again whenever the font size changes
  useLayoutEffect(() => {
    const host = measureRef.current;
    if (!host) return;

    const measure = () => {
      const next = Array.from(host.children).map((child) => child.getBoundingClientRect().width);
      setWidths((previous) =>
        previous.length === next.length && previous.every((w, i) => Math.abs(w - next[i]) < 0.5)
          ? previous
          : next,
      );
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(host);
    return () => observer.disconnect();
  }, [items.length]);

  const width = widths[activeIndex];
  const isMeasured = width !== undefined && width > 0;

  // growing starts at once (the new text needs the room); shrinking waits for the old text to clear
  const previousWidth = useRef(width);
  const isShrinking = previousWidth.current !== undefined && width !== undefined && width < previousWidth.current;
  useLayoutEffect(() => {
    previousWidth.current = width;
  }, [width]);

  const texts = items.map((item, index) => {
    const isActive = index === activeIndex;
    return (
      <motion.span
        key={index}
        aria-hidden={!isActive}
        className="absolute left-0 top-0 inline-block whitespace-nowrap"
        initial={false}
        animate={{ opacity: isActive ? 1 : 0, y: isActive ? 0 : index < activeIndex ? -10 : 10 }}
        transition={
          isActive
            ? { duration: IN_SECONDS, delay: OUT_SECONDS, ease: EASE }
            : { duration: OUT_SECONDS, ease: "easeIn" }
        }
      >
        {item}
      </motion.span>
    );
  });

  return (
    <span className={`relative inline-block whitespace-nowrap ${className}`}>
      {/* hidden copies of every item, only there to be measured */}
      <span
        ref={measureRef}
        aria-hidden
        className="pointer-events-none invisible absolute left-0 top-0 flex flex-col items-start"
      >
        {items.map((item, index) => (
          <span key={index} className="inline-block whitespace-nowrap">
            {item}
          </span>
        ))}
      </span>

      {/* The animated slot only exists once it has a width, so it starts at the right width
          instead of at nothing (which would pile every text on top of the others). */}
      {isMeasured ? (
        <motion.span
          className="relative inline-block whitespace-nowrap"
          initial={false}
          animate={{ width }}
          transition={{ duration: WIDTH_SECONDS, delay: isShrinking ? OUT_SECONDS * 0.8 : 0, ease: EASE }}
        >
          <span aria-hidden className="invisible">
            {" "}
          </span>
          {texts}
        </motion.span>
      ) : (
        <span className="relative inline-block whitespace-nowrap">
          <span aria-hidden className="invisible">
            {items[activeIndex]}
          </span>
        </span>
      )}
    </span>
  );
}
